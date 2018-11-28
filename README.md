# github-cms

![GitHub CMS](logo.png "GitHub CMS Logo")

Use your GitHub repositories as a content management system for your static site generator.

You can use this to provide markdown pages for your site if you are using anything like:

- Jekyll
- VuePress
- Gatsby
- Etc...

## Installation

Install globally to just use the executable:

```
npm install -g github-cms
github-cms --help
github-cms <github_account> [destination_directory]
```

Install inside your static site generator project to add it to your build process:

```
npm install --save github-cms
```

In `package.json`:

```json
"scripts": {
  "build": "github-cms <github_account> [destination_directory] && <your_normal_build_command>"
}
```

## Usage

This tool will scan the public GitHub repositories associated to the provided account
and will extract some data from them and save it locally as static files for your
static site generator to use when building your site.

### Saving as individual markdown files

By default, the tool will save one markdown file per repository found.
The markdown file will contain a frontmatter section with basic details
about the repository, followed by the contents of its `README.md` file.

Example:

```
---
title: supercoolrepo
description: >-
  This is the description you entered in the GitHub website about your repository.
url: "https://github.com/youraccount/supercoolrepo"
tags:
  - open-source
  - github
  - sample
---

# My super cool open source project

This software is very useful. Here's how to use it...
```

### Saving as a collection in a single JSON file

Sometimes you might not want to create an individual page in your site for each
of your repositories. Maybe you just want to list them on your site and display
their short description, and place a link to the actual GitHub repository page.
In those cases, you can use the `--json` option, and the tool will save a single
JSON file with an array of repository entries with only their frontmatter data.

Example:

```json
[
  {
    "title": "supercoolrepo",
    "description": "This is the description you entered in the GitHub website about your repository.",
    "url": "https://github.com/youraccount/supercoolrepo",
    "tags": ["open-source", "github", "sample"]
  },
  {
    "title": "github-cms",
    "description": "Use your GitHub repositories as a content management system for your static site generator.",
    "url": "https://github.com/operanditech/github-cms",
    "tags": ["cms", "github", "static-site-generator"]
  }
]
```

### Repository logo images

`github-cms` also has support for specifying a logo image for each repository.
The tool will download these images into the destination directory right next
to the markdown files or the JSON file. The logo image files will be named using
the name of each repo and the extension of the original image provided.
Your static site generator can then use these files when bundling the built site.

There are two ways to specify a logo image for a repository:

- In the root directory of the repository, place a file named `logo.png`.
  Using this method, only the PNG extension is supported.
- Specify any other image file in your repository using the
  [config file](#configuration-file), by specifying a `logo` entry in the
  custom frontmatter data. Read more about using config files below.

### Configuration file

You can override the default frontmatter data about a repository by placing
a config file in its root directory. This config file can also add new fields
to the frontmatter data that will be merged with the default ones.

The config file should be named `.github-cms.md` and it should contain
frontmatter data at the start, and optionally some markdown content after it.

The frontmatter data will be merged with the defaults and allows you
to override things like the location of the logo image file in your repository,
or the desired title of the page, description, tags, etc.

If there is any markdown content after the frontmatter data in the file,
it will be used as the content for the generated page instead of the `README.md`
file of the repository.

### Filtering repositories

The tool also provides a `--filter` option to make it only create pages for the
repositories that contain a `.github-cms.md` config file in their root directory.

### Using github-cms as a library

You can also import this tool as a library and use it programatically in your code:

```javascript
const loadGithubContent = require("github-cms");
// or
import loadGithubContent from "github-cms";

// Load repository content into static pages in a new directory
const account = "operanditech";
const directory = "projects";
// Optional parameters:
const filter = false;
const json = false;
const verbose = false;

await loadGithubContent(account, directory, filter, json, verbose);
```

## Contributing

Please submit an issue if you:

- Encounter any bug
- Have a feature suggestion
- Have any questions

Pull requests are welcome!
