const seleniumIDEPath = require('../constants/distPath')

module.exports = window => {
  const { session } = window.webContents
  session.loadExtension(seleniumIDEPath, {
    allowFileAccess: true,
  })
}
