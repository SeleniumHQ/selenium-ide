import { Session } from 'main/types'
import Handler from 'browser/helpers/Handler'

export const browser = Handler()

export const main =
  (_path: string, session: Session) =>
  async (background: Session['background']) => {
    session.background = background
  }
