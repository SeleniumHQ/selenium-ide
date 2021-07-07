import { IpcMainEvent } from 'electron'
import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandlerWithEvent from 'main/polyfill/classes/HandlerWithEvent'
import { TabData } from 'polyfill/types'

export type BrowserShape = () => TabData
export type MainShape = (event: IpcMainEvent) => TabData

export const browser = browserHandler<BrowserShape>()

export const main = mainHandlerWithEvent<MainShape>(
  (_path, session) => async (event) => {
    const { windows } = session
    const { withTab } = windows
    const tabID = event.sender.id
    const { tabs } = withTab(tabID)
    return tabs.read(tabID).data
  }
)
