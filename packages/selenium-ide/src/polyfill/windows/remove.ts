import Handler from 'browser/helpers/Handler'
import { Session } from 'main/types'
import { WindowData } from 'polyfill/types'

export const browser = Handler()

export const main =
  (_path: string, session: Session) =>
  async (windowID: number): Promise<WindowData> => {
    // Add our Selenium IDE v3 page as a tab
    const { windows } = session
    return windows.getData(windows.remove(windowID))
  }
