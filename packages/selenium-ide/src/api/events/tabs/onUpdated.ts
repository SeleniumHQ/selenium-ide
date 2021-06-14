import { Session, TabDelta, TabShim } from '../../../types'

type BrowserTabsOnUpdatedShape = [number, TabDelta, TabShim]
export default (_session: Session) => (
  tab: TabShim
): BrowserTabsOnUpdatedShape => [tab.id, tab, tab]
