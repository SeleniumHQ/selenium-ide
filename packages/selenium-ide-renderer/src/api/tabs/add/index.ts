import { ApiHandler, LoadedWindow } from '../../../types'

const HTMLTemplate = (title: string): string => `
  <div class="etabs-tab visible">
    <span class="etabs-tab-title" title="${title}">
      ${title}
    </span>
    <span class="etabs-tab-buttons">
      <button class="etabs-tab-button-close">×</button>
    </span>
  </div>
`

const addTab: ApiHandler = (id, title, options = {}) => {
  const { seleniumIDE } = window as LoadedWindow
  const tabsContainer = document.querySelector('.etabs-tabs') as Element
  const div = document.createElement('div')
  div.id = `tab-${id}`
  div.innerHTML = HTMLTemplate(title)
  tabsContainer.appendChild(div)
  div.addEventListener('click', () => seleniumIDE.server.tabs.select(id))
  if (!options?.locked) {
    const closeButton = div.querySelector('.etabs-tab-button-close') as Element
    closeButton.addEventListener('click', e => {
      e.preventDefault()
      seleniumIDE.server.tabs.remove(id)
      tabsContainer.removeChild(div)
    })
  }
}
export default addTab
