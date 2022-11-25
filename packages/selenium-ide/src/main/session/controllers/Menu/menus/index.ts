import { Menu } from 'electron'
import { Session } from 'main/types'
import application from './application'
import editBasics from './editBasics'
import playback from './playback'
import projectEditor from './projectEditor'
import projectView from './projectView'
import suiteManager from './suiteManager'
import testEditor from './testEditor'
import testManager from './testManager'
import textField from './textField'

export interface Menus {
  [key: string]: (session: Session) => (...args: any[]) => Menu
}

const menus = {
  application,
  editBasics,
  playback,
  projectEditor,
  suiteManager,
  testEditor,
  projectView,
  testManager,
  textField,
} as const

export default menus
