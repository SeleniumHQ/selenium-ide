import { BrowserView, BrowserWindow } from 'electron'
import curryN from 'lodash/fp/curryN'
import { ApiHandler, Config } from '../../../types'
import { tabs } from '../TabManager'

/**
 * This code isn't used, but I kept it around
 * because this represents the right way that the client
 * requests elevated permission actions from Electron
 */

const setActiveControllerView = (
  window: BrowserWindow,
  controllerView: BrowserView
) => {
  const bounds = window.getBounds()
  controllerView.setBounds({
    x: 0,
    y: 33,
    width: bounds.width,
    // We leave a bit of extra margin here to deal with this:
    // https://github.com/electron/electron/issues/13468#issuecomment-445441789
    height: bounds.height - 50,
  })
  controllerView.setAutoResize({
    height: true,
    horizontal: false,
    vertical: false,
    width: true,
  })
}

const setInactiveControllerView = (controllerView: BrowserView) => {
  controllerView.setBounds({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  controllerView.setAutoResize({
    height: false,
    horizontal: false,
    vertical: false,
    width: false,
  })
}

export default curryN(
  2,
  async ({ api, window }: Config, selectedTabID: number) => {
    // Add our Selenium IDE v3 page as a tab
    Object.keys(tabs).forEach(tabIDString => {
      const tabID = parseInt(tabIDString)
      if (tabID == selectedTabID) setActiveControllerView(window, tabs[tabID])
      else setInactiveControllerView(tabs[tabID])
    })
    api.client.tabs.select(selectedTabID)
  }
) as ApiHandler
