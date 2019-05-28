const exec = require('child_process').execSync
const grizzly = require('grizzly')
const putasset = require('putasset')
const token = process.env.GH_TOKEN
const owner = 'SeleniumHQ'
const repo = 'selenium-ide'
const manifest = require('./packages/selenium-ide/src/manifest.json')
const tag = 'v' + manifest.version

function log(message) {
  console.log(`[ GitHub Release ]: ${message}`) // eslint-disable-line
}

if (!token)
  throw new Error(
    "No GitHub application token provided on environment variable GH_TOKEN. Don't have one? Get yours at https://github.com/settings/tokens"
  )

// fetch changelog details
const changelog = exec(
  `sed '1,/${tag}/d;/## v/q' ./changelog.md | sed '/^ *$/q'`,
  {
    encoding: 'utf8',
  }
).trim()

// zip build dir
exec(
  'zip -r packages/selenium-ide/build/selenium-ide.zip packages/selenium-ide/build/'
)
log('Zipped build directory')

// create release with changelog
grizzly(token, {
  user: owner,
  repo,
  tag,
  name: tag,
  body: changelog,
  prerelease: false,
})
  .then(() => {
    log(
      `Release published on GitHub, url: https://github.com/${owner}/${repo}/releases/tag/${tag}`
    )
    // upload asset to release
    putasset(token, {
      owner,
      repo,
      tag,
      filename: 'build/applitools-for-selenium-ide.zip',
    })
      .then(url => {
        log(`Upload success, download url: ${url}`)
      })
      .catch(error => {
        log(error.message)
      })
  })
  .catch(error => {
    log(error.message)
  })
