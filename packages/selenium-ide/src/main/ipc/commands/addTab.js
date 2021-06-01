const { BrowserView } = require('electron')

/**
 * This code isn't used, but I kept it around
 * because this represents the right way that the client
 * requests elevated permission actions from Electron
 */
module.exports = (_event, path) => {
  const controllerView = new BrowserView()
  controllerView.setBounds({ x: 0, y: 33, width: 1460, height: 840 - 33 })
  controllerView.webContents.loadURL(path)
  controllerView.webContents.openDevTools()
}
