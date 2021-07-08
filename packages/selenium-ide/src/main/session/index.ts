import { App, Menu } from 'electron'
import Api from '../api'
import Driver from './driver'
import { Config, Session } from '../types'
import Storage from '../storage'

export default async function createSession(
  app: App,
  config: Config,
  storage: typeof Storage
): Promise<Session> {
  const partialSession: Partial<Session> = {
    app,
    config,
    storage,
    menu: new Menu(),
  }
  partialSession.api = await Api(partialSession as Session)
  partialSession.driver = Driver(partialSession as Session)
  const session = partialSession as Session
  // Creating the window and pointing it at the SIDE extension URL
  const ideWindow = await session.api.windows.create()

  return session
}
