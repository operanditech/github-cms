const fetch = require('node-fetch')
const parseLinkHeader = require('parse-link-header')
const matter = require('gray-matter')
const fs = require('fs')
const path = require('path')

async function fetchContent(
  owner,
  directory,
  filter = false,
  json = false,
  verbose = false
) {
  if (verbose) {
    console.log('Fetching repository list for account:', owner)
  }
  const repos = await fetchRepoList(owner)
  if (verbose) {
    console.log(`Found ${repos.length} repositories`)
  }

  fs.mkdirSync(directory, { recursive: true })

  for (const repo of repos) {
    if (verbose) {
      console.log('Fetching data for repository:', repo.title)
    }

    const frontmatter = await fetchFrontmatter(owner, repo.title)
    if (frontmatter || !filter) {
      // Frontmatter
      let content
      if (frontmatter) {
        const config = matter(frontmatter)
        Object.assign(repo, config.data)
        content = config.content
      }

      // Logo
      const repoLogoPath = repo.logo || 'logo.png'
      const logo = await fetchLogo(owner, repo.title, repoLogoPath)
      if (logo) {
        const savedLogoPath = path.join(
          directory,
          `${repo.title}.${path.extname(repoLogoPath)}`
        )
        fs.writeFileSync(savedLogoPath, logo)
        repo.logo = savedLogoPath
      } else {
        delete repo.logo
      }

      // Content
      if (!json) {
        if (!content || content.trim().length === 0) {
          content = (await fetchReadme(owner, repo.title)) || ''
        }
        fs.writeFileSync(
          path.join(directory, `${repo.title}.md`),
          matter.stringify(content, repo)
        )
      }
    }
  }
  if (json) {
    fs.writeFileSync(
      path.join(directory, `repositories.json`),
      JSON.stringify(repos)
    )
  }
}

module.exports = fetchContent

function mapRepo(r) {
  return {
    title: r.name,
    description: r.description || '',
    url: r.html_url,
    tags: r.topics || []
  }
}

async function fetchRepoList(owner) {
  let res = await fetch(`https://api.github.com/orgs/${owner}/repos`, {
    headers: {
      Accept: 'application/vnd.github.mercy-preview+json'
    }
  })
  if (res.status === 404) {
    res = await fetch(`https://api.github.com/users/${owner}/repos`, {
      headers: {
        Accept: 'application/vnd.github.mercy-preview+json'
      }
    })
  }
  if (res.status === 404) {
    throw new Error('User or organization not found')
  }
  let repos = (await res.json()).map(mapRepo)
  let pages = parseLinkHeader(res.headers.get('link'))

  while (pages && pages.next) {
    res = await fetch(pages.next.url)
    repos = repos.concat((await res.json()).map(mapRepo))
    pages = parseLinkHeader(res.headers.get('link'))
  }
  return repos
}

async function fetchFrontmatter(owner, repoName) {
  const res = await fetch(
    `https://raw.github.com/${owner}/${repoName}/master/.github-cms.md`
  )
  if (res.status !== 404) {
    return res.text()
  }
}

async function fetchReadme(owner, repoName) {
  const res = await fetch(
    `https://raw.github.com/${owner}/${repoName}/master/README.md`
  )
  if (res.status !== 404) {
    return res.text()
  }
}

async function fetchLogo(owner, repoName, logoPath, directory) {
  const res = await fetch(
    `https://raw.github.com/${owner}/${repoName}/master/${logoPath}`
  )
  if (res.status !== 404) {
    return res.raw()
  }
}
