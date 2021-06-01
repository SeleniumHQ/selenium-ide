const { ipcMain } = require('electron')
const commands = require('./commands')

/**
 * This module takes the client preload channels
 * and maps them to the corresponding commands in `./commands`
 */
module.exports = config => {
  Object.entries(commands).forEach(([name, handler]) =>
    ipcMain.on(name, handler(config))
  )
}
