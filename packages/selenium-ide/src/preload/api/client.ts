import { ipcRenderer } from 'electron'
import processAPI from '../../common/processAPI'

export default processAPI('client', ({ load, path }) => {
  const handler = load()
  ipcRenderer.on(path, async (_event, ...args) => {
    console.debug(`Received command ${path} with args`, ...args)
    const results = await handler(...args)
    console.debug(`Replying to ${path} with results`, results)
    ipcRenderer.send(`${path}.complete`, results)
  })
  return handler
})
