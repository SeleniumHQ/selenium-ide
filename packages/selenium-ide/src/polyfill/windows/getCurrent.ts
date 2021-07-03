import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'
import { WindowData } from 'polyfill/types'

export type Shape = () => Promise<WindowData>

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async () => {
  // Make the main window
  const { windows } = session
  return windows.getData(windows.read(windows.getActive()))
})
