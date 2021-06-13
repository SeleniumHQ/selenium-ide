import Api from './api'
import Driver from './driver'
import Extension from './extension'
import Tabs from './tabs'
import Window from './window'
import { Session } from '../types'

export default createSession

async function createSession(app: Electron.App): Promise<Session> {
  const window = await Window()
  const tabManager = await Tabs()
  const driver = await Driver()
  const session: Session = {
    api: (null as unknown) as Session['api'],
    app,
    driver,
    extension: (null as unknown) as Session['extension'],
    tabManager,
    window,
  }
  session.api = await Api(session)
  session.extension = await Extension(session.api)
  session.api.server.lifecycle.init(null)
  return session
}
