#!/usr/bin/env node

const program = require('commander')
const fetchContent = require('../index.js')
const version = require('../package.json').version

program
  .version(version)
  .arguments('<account> [directory]')
  .description(
    `Extract the readme files of all the repositories associated
to a GitHub account (user or org) and save them to a local
directory (default: current directory).
This tool will also attach basic Frontmatter data to the files.
You can extend the Frontmatter data that is attached by placing
a '.github-cms' file in each repository.
In addition, if a repository contains a 'logo.png' file, it will
also be downloaded and stored next to the readme file with the
name of the repository.`
  )
  .option(
    '-f, --filter',
    "fetch only repositories that contain a '.github-cms' file",
    true
  )
  .option('-j, --json', 'save only the frontmatter data to a JSON file')
  .option('-q, --quiet', 'do not log progress to stdout')
  .parse(process.argv)

main().catch(e => {
  console.error(e)
  process.exit(1)
})

async function main() {
  const [account, directory] = program.args
  if (!account) {
    console.error('Missing required argument: <account>')
    program.help()
  }
  await fetchContent(
    account,
    directory || './repositories',
    program.filter,
    program.json,
    !program.quiet
  )
}
