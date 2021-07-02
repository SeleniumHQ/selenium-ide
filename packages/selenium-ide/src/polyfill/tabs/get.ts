import Handler from 'browser/helpers/Handler'
import { Session } from 'main/types'

export const browser = Handler()

export const main =
  (_path: string, session: Session) => async (tabID: number) => {
    const { windows } = session
    const { withTab } = windows
    const { tabs } = withTab(tabID)
    return tabs.read(tabID).data
  }
