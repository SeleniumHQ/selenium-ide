const { join } = require('path')

const seleniumIDEPath = join(
  __dirname,
  'node_modules',
  'selenium-ide',
  'packages',
  'selenium-ide',
  'build'
)

module.exports = window => {
  const { session } = window.webContents
  session.loadExtension(seleniumIDEPath, {
    allowFileAccess: true,
  })
}
