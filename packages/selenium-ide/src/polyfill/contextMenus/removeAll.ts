import { Menu } from 'electron'
import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'

export type Shape = () => Promise<void>

export const browser = browserHandler<Shape>()
export const main = mainHandler(
  (_path, session): Shape =>
    async () => {
      session.menu = new Menu()
    }
)
