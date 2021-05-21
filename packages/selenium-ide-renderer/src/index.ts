import TabGroup, { TabOptions } from 'electron-tabs'
import 'electron-tabs/electron-tabs.css'

const startingTab: TabOptions = {
  title: 'Selenium IDE Controller',
  src: 'chrome-extension://mooikfkahbdckldjjndioackbalphokd/index.html',
  visible: true,
}

const tabGroup = new TabGroup({
  newTab: startingTab,
})

tabGroup.addTab(startingTab)
