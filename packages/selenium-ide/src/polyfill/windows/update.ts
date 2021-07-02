import Handler from 'browser/helpers/Handler'
import { Session } from 'main/types'

export const browser = Handler()

export interface UpdateWindowOptions {
  focused?: boolean
}

export const main =
  (_path: string, session: Session) =>
  async (windowId: number, options: UpdateWindowOptions): Promise<void> => {
    const { windows } = session
    // Only our approved extension gets bootstrapped, for now
    if (options.focused) {
      windows.select(windowId)
    }
  }
