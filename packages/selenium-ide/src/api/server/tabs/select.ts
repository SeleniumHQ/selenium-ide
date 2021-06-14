import { BrowserView, BrowserWindow } from 'electron'
import curryN from 'lodash/fp/curryN'
import { ApiHandler, Session } from '../../../types'

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
  async ({ api, tabManager, window }: Session, selectedTabID: number) => {
    const { getActive, get, select } = tabManager
    const activeTabID = getActive()
    const selectedTab = select(selectedTabID)
    setActiveControllerView(window, selectedTab)
    /**
     * Reasons not to inactivate the prior window:
     * 1. It never existed (first window is selected)
     * 2. Its just been deleted
     */
    const activeTab = get(activeTabID)
    if (activeTabID !== null) {
      if (activeTab) {
        setInactiveControllerView(activeTab)
      }
    }
    await api.client.tabs.select(selectedTabID)
  }
) as ApiHandler
