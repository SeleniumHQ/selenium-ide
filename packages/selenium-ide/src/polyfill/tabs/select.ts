import Handler from 'browser/helpers/Handler'
import { BrowserView, BrowserWindow } from 'electron'
import { Session } from 'main/types'

export const browser = Handler()

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

export const main =
  (_path: string, session: Session) => async (selectedTabID: number) => {
    const { windows } = session
    const { tabs, window } = windows.withTab(selectedTabID)
    const { getActive, read, select } = tabs
    const activeTabID = getActive()
    if (selectedTabID !== activeTabID) {
      const selectedTab = select(selectedTabID)
      setActiveControllerView(window, selectedTab.view)
      tabs.update(selectedTabID, { active: true })
      /**
       * Reasons not to inactivate the prior window:
       * 1. It never existed (first window is selected)
       * 2. Its just been removed
       */
      if (activeTabID !== null) {
        const activeTab = read(activeTabID)
        if (activeTab) {
          setInactiveControllerView(activeTab.view)
          tabs.update(activeTabID, { active: false })
        }
      }
    }
  }
