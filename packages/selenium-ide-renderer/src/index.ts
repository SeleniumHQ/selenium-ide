import { LoadedWindow } from './types'

const { seleniumIDE } = window as LoadedWindow

// Let the client define its API using the ipcRenderer .on listeners
seleniumIDE.server.lifecycle.init(null)
