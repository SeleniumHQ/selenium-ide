import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'
import { WindowData } from 'polyfill/types'

export type Shape = (windowId: number) => WindowData

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async (windowId) => {
  // Make the main window
  const { windows } = session
  return windows.read(windowId).data
})
