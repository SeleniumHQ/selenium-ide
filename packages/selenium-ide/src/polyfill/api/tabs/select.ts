import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'

export type Shape = (selectedTabID: number) => void

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(
  (_path, session) => async (selectedTabID) => {
    session.windows.withTab(selectedTabID).tabs.select(selectedTabID)
  }
)
