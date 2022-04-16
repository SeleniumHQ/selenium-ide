import { Menu } from 'electron'
import { Session } from 'main/types'
import application from './application'
import projectEditor from './projectEditor'
import testEditor from './testEditor'

export interface Menus {
  [key: string]: (session: Session) => (...args: any[]) => Menu
}

const menus = {
  application,
  projectEditor,
  testEditor,
} as const

export default menus
