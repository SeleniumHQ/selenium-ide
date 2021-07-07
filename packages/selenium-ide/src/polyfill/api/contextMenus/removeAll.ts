import { Menu } from 'electron'
import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'

export type Shape = () => void

export const browser = browserHandler<Shape>()
export const main = mainHandler<Shape>((_path, session) => async () => {
  session.menu = new Menu()
})
