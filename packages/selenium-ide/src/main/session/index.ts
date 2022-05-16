import { App } from 'electron'
import Api from '../api'
import { Session, Storage } from '../types'
import ArgTypesController from './controllers/ArgTypes'
import CommandsController from './controllers/Commands'
import DialogsController from './controllers/Dialogs'
import DriverController from './controllers/Driver'
import MenuController from './controllers/Menu'
import PlaybackController from './controllers/Playback'
import PluginsController from './controllers/Plugins'
import ProjectsController from './controllers/Projects'
import RecorderController from './controllers/Recorder'
import StateController from './controllers/State'
import SuitesController from './controllers/Suites'
import SystemController from './controllers/System'
import TestsController from './controllers/Tests'
import WindowsController from './controllers/Windows'

export default function createSession(
  app: App,
  store: Storage
): Session {
  // Building our session object
  const partialSession: Partial<Session> = {
    app,
    store,
  }
  partialSession.dialogs = new DialogsController(partialSession as Session)
  partialSession.argTypes = new ArgTypesController(partialSession as Session)
  partialSession.commands = new CommandsController(partialSession as Session)
  partialSession.driver = new DriverController(partialSession as Session)
  partialSession.menus = new MenuController(partialSession as Session)
  partialSession.playback = new PlaybackController(partialSession as Session)
  partialSession.plugins = new PluginsController(partialSession as Session)
  partialSession.projects = new ProjectsController(partialSession as Session)
  partialSession.recorder = new RecorderController(partialSession as Session)
  partialSession.state = new StateController(partialSession as Session)
  partialSession.suites = new SuitesController(partialSession as Session)
  partialSession.system = new SystemController(partialSession as Session)
  partialSession.tests = new TestsController(partialSession as Session)
  partialSession.windows = new WindowsController(partialSession as Session)
  partialSession.api = Api(partialSession as Session)

  const session = partialSession as Session
  return session
}
