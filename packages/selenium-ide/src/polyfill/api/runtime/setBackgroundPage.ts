import { Session } from 'main/types'
import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'

export type Shape = (background: Session['background']) => void
export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(
  (_path, session) => async (background) => {
    session.background = background
  }
)
