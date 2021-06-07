import curryN from 'lodash/fp/curryN'
import { ApiHandler, Config } from '../../../types'
import { getActive, remove, tabs } from '../TabManager'

/**
 * This code isn't used, but I kept it around
 * because this represents the right way that the client
 * requests elevated permission actions from Electron
 */

export default curryN(2, ({ api, window }: Config, tabID: number): void => {
  // Add our Selenium IDE v3 page as a tab
  const view = remove(tabID)
  window.removeBrowserView(view)
  if (getActive() === tabID) {
    api.server.tabs.select(parseInt(Object.keys(tabs)[0]))
  }
}) as ApiHandler
