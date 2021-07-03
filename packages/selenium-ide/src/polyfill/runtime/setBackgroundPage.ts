import { Session } from 'main/types'
import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'

export type Shape = (background: Session['background']) => Promise<void>
export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(
  (_path, session) => async (background) => {
    session.background = background
  }
)
