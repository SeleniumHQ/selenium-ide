import { LoadedWindow } from 'browser/types'
import { WindowData } from 'api/types'

/**
 * Just very minimally adding buttons
 */
const CloseButtonHTMLTemplate = `
  <span class="etabs-tab-buttons">
    <button class="etabs-tab-button-close">×</button>
  </span>
`

const HTMLTemplate = (title: string, allowClose: boolean): string => `
  <div class="etabs-tab visible">
    <span class="etabs-tab-title">
      ${title}
    </span>
    <span class="etabs-tab-buttons">
    </span>
    ${allowClose ? CloseButtonHTMLTemplate : ''}
  </div>
`

const { sideAPI } = window as LoadedWindow

sideAPI.tabs.onCreated.addListener((tab) => {
  sideAPI.windows.getCurrent().then((data: WindowData) => {
    if (tab.windowId !== data.id) return
    const { id, title, url } = tab
    const allowClose = url.startsWith('chrome-extension://')
    const tabsContainer = document.querySelector('.etabs-tabs') as Element
    if (!tabsContainer) {
      return
    }
    const div = document.createElement('div')
    div.id = `tab-${id}`
    div.innerHTML = HTMLTemplate(title, allowClose)
    tabsContainer.appendChild(div)
    div.addEventListener('click', () => sideAPI.tabs.select(id))
    if (allowClose) {
      const closeButton = div.querySelector(
        '.etabs-tab-button-close'
      ) as Element
      closeButton.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await sideAPI.tabs.remove(id)
        tabsContainer.removeChild(div)
      })
    }
  })
})
sideAPI.tabs.onUpdated.addListener((id, tabChanges) => {
  sideAPI.windows.getCurrent().then((data: WindowData) => {
    if (!data.tabs.find((tab) => id === tab.id)) {
      return
    }
    const activeTabClass = 'etabs-tab.active'
    const tab = document.querySelector(`#tab-${id}`) as Element
    if (tabChanges.active === false) {
      tab.classList.remove(activeTabClass)
    } else if (tabChanges.active === true) {
      tab.classList.add(activeTabClass)
    }
    if (tabChanges.title) {
      const titleElement = tab.querySelector('.etabs-tab-title') as Element
      titleElement.innerHTML = tabChanges.title
    }
  })
})
sideAPI.tabs.onRemoved.addListener((id) => {
  sideAPI.windows.getCurrent().then((data: WindowData) => {
    if (!data.tabs.find((tab) => id === tab.id)) {
      return
    }
    if (id !== data.id) return
    const tabsContainer = document.querySelector('.etabs-tabs') as Element
    const tab = document.querySelector(`#tab-${id}`) as Element
    tabsContainer.removeChild(tab)
  })
})
