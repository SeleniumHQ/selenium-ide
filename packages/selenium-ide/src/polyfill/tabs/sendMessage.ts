import EventListener from 'browser/helpers/EventListener'
import { ipcRenderer } from 'electron'
import { Session } from 'main/types'

export const browser = EventListener()

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

export const main = (session: Session) =>
  async (tabID: number, ...args: any[]) => {
    const { windows } = session
    const tab = windows.getTab(tabID)
    const messageID = getMessageID()
    ipcRenderer.sendTo
  }
