import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'
import { WindowData } from 'polyfill/types'

export type Shape = (windowID: number) => WindowData

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async (windowID) => {
  const entry = session.windows.read(windowID)
  entry.window.close()
  return entry.data
})
