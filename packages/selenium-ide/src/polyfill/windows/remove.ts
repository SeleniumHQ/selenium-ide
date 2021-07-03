import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'
import { WindowData } from 'polyfill/types'

export type Shape = (windowID: number) => Promise<WindowData>

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async (windowID) => {
  // Add our Selenium IDE v3 page as a tab
  const { windows } = session
  return windows.getData(windows.remove(windowID))
})
