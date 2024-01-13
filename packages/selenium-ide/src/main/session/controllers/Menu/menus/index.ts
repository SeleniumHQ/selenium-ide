import { MenuComponent } from 'main/types'
import application, {commands as applicationCommands} from './application'
import editBasics, {commands as editBasicsCommands} from './editBasics'
import playback, {commands as playbackCommands} from './playback'
import projectEditor, {commands as projectEditorCommands} from './projectEditor'
import projectView, {commands as projectViewCommands} from './projectView'
import suiteManager, {commands as suiteManagerCommands} from './suiteManager'
import testEditor, {commands as testEditorCommands} from './testEditor'
import testManager, {commands as testManagerCommands} from './testManager'
import textField, {commands as textFieldCommands} from './textField'

export interface Menus {
  [key: string]: MenuComponent
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

export const commands = {
  application: applicationCommands,
  editBasics: editBasicsCommands,
  playback: playbackCommands,
  projectEditor: projectEditorCommands,
  suiteManager: suiteManagerCommands,
  testEditor: testEditorCommands,
  projectView: projectViewCommands,
  testManager: testManagerCommands,
  textField: textFieldCommands,
} as const

export default menus
