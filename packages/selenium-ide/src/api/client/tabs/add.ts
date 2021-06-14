import { ApiHandler, LoadedWindow, TabShim } from '../../../types'

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
    <span class="etabs-tab-title" title="${title}">
      ${title}
    </span>
    <span class="etabs-tab-buttons">
    </span>
    ${allowClose ? CloseButtonHTMLTemplate : ''}
  </div>
`

const addTab: ApiHandler = (tab: TabShim, options = {}) => {
  const { id, title } = tab
  const { seleniumIDE } = window as LoadedWindow
  const allowClose = !options.isSelenium
  const tabsContainer = document.querySelector('.etabs-tabs') as Element
  const div = document.createElement('div')
  div.id = `tab-${id}`
  div.innerHTML = HTMLTemplate(title, allowClose)
  tabsContainer.appendChild(div)
  div.addEventListener('click', () => seleniumIDE.server.tabs.select(id))
  if (allowClose) {
    const closeButton = div.querySelector('.etabs-tab-button-close') as Element
    closeButton.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      seleniumIDE.server.tabs.remove(id)
      tabsContainer.removeChild(div)
    })
  }
  return tab
}
export default addTab
