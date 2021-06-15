const removeTab = (id: number): void => {
  const tabsContainer = document.querySelector('.etabs-tabs') as Element
  const div = document.querySelector(`#tab-${id}`) as Element
  tabsContainer.removeChild(div)
}
export default removeTab
