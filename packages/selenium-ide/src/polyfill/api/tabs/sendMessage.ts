import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'
import { ipcRenderer } from 'electron'
import { VariadicArgs } from 'polyfill/types'

let _messageID = 1
/**
 * Loops on a big enough interval to be safe of conflict
 */
function getMessageID() {
  const id = _messageID
  _messageID += 1
  if (_messageID > 100000000) {
    _messageID = 1
  }
  return id
}

export type Shape = (tabID: number, ...args: VariadicArgs) => void

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((path, session) => (tabID, ...args) => {
  const { windows } = session
  const tab = windows.getTab(tabID)
  const messageID = getMessageID()
  ipcRenderer.sendTo(tab.view.webContents.id, path, messageID, ...args)
})
