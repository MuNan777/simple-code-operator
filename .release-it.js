module.exports = {
  git: {
    tagName: '${version}',
    commitMessage: 'release: ${version}',
    requireCleanWorkingDir: false,
    requireBranch: 'main',
  },
  hooks: {
    "before:init": ["git pull origin main"]
  },
  npm: {
    publish: false,
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: 'angular',
      infile: 'CHANGELOG.md',
    },
  },
}