import { TabData } from '../../../types'

const updateTab = ({ id, title }: Partial<TabData>): void => {
  const tab = document.querySelector(`#tab-${id}`) as Element
  if (title) {
    const titleElement = tab.querySelector('.etabs-tab-title') as Element
    titleElement.innerHTML = title
  }
}
export default updateTab
