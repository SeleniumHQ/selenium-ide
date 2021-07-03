import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'
import { WindowData } from '../types'

export type Shape = (windowId: number) => WindowData

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => (windowId) => {
  // Make the main window
  const { windows } = session
  return windows.getData(windows.read(windowId))
})
