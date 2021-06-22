import Api from './api'
import Driver from './driver'
import Extension from './extension'
import Tabs from './recorder'
import Window from './window'
import { Config, Session } from '../types/server'

export default createSession

async function createSession(
  app: Electron.App,
  config: Config
): Promise<Session> {
  const session: Partial<Session> = {
    app,
    config,
  }
  session.window = await Window(session as Session)
  session.driver = Driver(session as Session)
  session.api = await Api(session as Session)
  session.tabs = await Tabs(session as Session)
  session.extension = await Extension(session.api)
  const extensionTabData = await session.api.server.tabs.create(
    `${session.extension.url}index.html`
  )
  session.extensionView = session.tabs.read(extensionTabData.id).view
  return session as Session
}
