import { BrowserWindow, IpcMainEvent } from 'electron'
import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandlerWithEvent from 'main/polyfill/classes/HandlerWithEvent'
import { WindowData } from 'polyfill/types'
import WindowEntry from 'main/session/classes/windows/Entry'

export type BrowserShape = () => WindowData
export type MainShape = (event: IpcMainEvent) => WindowData

export const browser = browserHandler<BrowserShape>()

export const main = mainHandlerWithEvent<MainShape>(
  (_path, session) => async (event) => {
    console.log(
      event.sender.id,
      session.windows.entries.map(({ id }) => id),
      session.windows.read(event.sender.id),
      session.windows.withTab(event.sender.id)
    )
    let window = session.windows.read(event.sender.id)
    if (!window) window = session.windows.withTab(event.sender.id)
    if (!window) {
      window = session.windows.create(
        new WindowEntry(
          session,
          BrowserWindow.fromWebContents(event.sender) as BrowserWindow
        )
      )
    }
    return window.data
  }
)
