import { LoadedWindow } from '../types/client'

const { seleniumIDE } = window as LoadedWindow

seleniumIDE.events.tabs.onUpdated.addListener(([_id, _tabChanges, tabData]) => {
  seleniumIDE.client.tabs.update(tabData)
})
