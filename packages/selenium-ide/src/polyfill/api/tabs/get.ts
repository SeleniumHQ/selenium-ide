import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'
import { TabData } from 'polyfill/types'

export type Shape = (tabID: number) => TabData

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async (tabID) => {
  const { windows } = session
  const { withTab } = windows
  const { tabs } = withTab(tabID)
  return tabs.read(tabID).data
})
