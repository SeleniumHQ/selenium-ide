import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'
import { TabData } from 'polyfill/types'

export type Shape = (tabID: number) => Promise<TabData>

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async (tabID) => {
  const { windows } = session
  const { withTab } = windows
  const { tabs } = withTab(tabID)
  return tabs.read(tabID).data
})
