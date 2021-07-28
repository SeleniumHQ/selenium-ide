import { App, Menu } from 'electron'
import Api from '../api'
import { Config, Session } from '../types'
import ArgTypesController from './controllers/ArgTypes'
import CommandsController from './controllers/Commands'
import DialogsController from './controllers/Dialogs'
import DriverController from './controllers/Driver'
import PlaybackController from './controllers/Playback'
import PluginsController from './controllers/Plugins'
import ProjectsController from './controllers/Projects'
import RecorderController from './controllers/Recorder'
import StateController from './controllers/State'
import SuitesController from './controllers/Suites'
import TestsController from './controllers/Tests'
import VariablesController from './controllers/Variables'
import WindowsController from './controllers/Windows'

export default async function createSession(
  app: App,
  config: Config
): Promise<Session> {
  // Building our session object
  const partialSession: Partial<Session> = {
    app,
    config,
    dialogs: new DialogsController(),
    menu: new Menu(),
    state: new StateController(),
  }
  partialSession.argTypes = new ArgTypesController(partialSession as Session)
  partialSession.commands = new CommandsController(partialSession as Session)
  partialSession.driver = new DriverController(partialSession as Session)
  partialSession.playback = new PlaybackController(partialSession as Session)
  partialSession.plugins = new PluginsController(partialSession as Session)
  partialSession.projects = new ProjectsController(partialSession as Session)
  partialSession.recorder = new RecorderController(partialSession as Session)
  partialSession.suites = new SuitesController(partialSession as Session)
  partialSession.tests = new TestsController(partialSession as Session)
  partialSession.variables = new VariablesController(partialSession as Session)
  partialSession.windows = new WindowsController(partialSession as Session)
  partialSession.api = await Api(partialSession as Session)
  const session = partialSession as Session

  // Creating the window for project selection
  session.windows.open('splash')

  return session
}
