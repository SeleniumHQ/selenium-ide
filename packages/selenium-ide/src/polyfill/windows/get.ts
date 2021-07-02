import Handler from 'browser/helpers/Handler'
import { Session } from 'main/types'

export const browser = Handler()

export const main =
  (_path: string, session: Session) => async (windowId: number) => {
    // Make the main window
    const { windows } = session
    return windows.getData(windows.read(windowId))
  }
