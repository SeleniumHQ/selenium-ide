import { TabData } from '../../../types'
import { LoadedWindow } from '../../../types/client'

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
export interface AddTabOptions {
  isExtension?: boolean
}

const addTab = (tab: TabData, options: AddTabOptions = {}): void => {
  const { id, title } = tab
  const { seleniumIDE } = window as LoadedWindow
  const allowClose = !options.isExtension
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
}
export default addTab
