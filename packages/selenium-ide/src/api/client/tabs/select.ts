import { ApiHandler } from '../../../types'

const activeTabClass = 'etabs-tab.active'
const selectTab: ApiHandler = id => {
  const tabsContainer = document.querySelector('.etabs-tabs') as Element
  tabsContainer.childNodes.forEach((node: ChildNode): void => {
    const el = node as HTMLElement
    el.classList.remove(activeTabClass)
  })
  const div = document.querySelector(`#tab-${id}`) as Element
  div.classList.add(activeTabClass)
}
export default selectTab
