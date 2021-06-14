import { ipcRenderer } from 'electron'
import processAPI from '../../common/processAPI'

/**
 * This module uses the preload step to establish secured IPC channels
 * for the client to request elevated privelege requests against the system
 * Writes file batches, installs extensions from file URLs, etc

 * As a result, these commands should be made as safe as possible.

 * We don't actually have access to the app or window here,
 * so we can just fake it to hydrate our API shapes
 * By fake it, I mean a complete null value as the main

 * The reason for this is to get 
 */
export default processAPI('server', ({ path }) => (...args: any[]) =>
  new Promise(resolve => {
    console.debug(`Received command ${path} with args`, ...args)
    ipcRenderer.once(`${path}.complete`, (_event, ...args2) => {
      console.debug('Replying to', path, 'with results', args2)
      resolve(args2)
    })
    ipcRenderer.send(path, ...args)
  })
)
