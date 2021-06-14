import Api from './api'
import Driver from './driver'
import Extension from './extension'
import Tabs from './tabs'
import Window from './window'
import { Config, Session } from '../types'

export default createSession

async function createSession(
  app: Electron.App,
  config: Config
): Promise<Session> {
  const session: Session = {
    api: (null as unknown) as Session['api'],
    app,
    config,
    driver: (null as unknown) as Session['driver'],
    extension: (null as unknown) as Session['extension'],
    extensionView: (null as unknown) as Session['extensionView'],
    tabManager: await Tabs(),
    window: (null as unknown) as Session['window'],
  }
  session.window = await Window(session)
  session.driver = await Driver()
  session.api = await Api(session)
  session.extension = await Extension(session.api)
  console.log('Running tab shim')
  const extensionTabShim = await session.api.server.tabs.add(
    `${session.extension.url}index.html`,
    'Selenium IDE Controller'
  )
  session.extensionView = session.tabManager.get(extensionTabShim.id)
  return session
}
