import { App, Menu } from 'electron'
import Api from '../polyfill'
import background from './background'
import Driver from './driver'
import WindowsList from './classes/windows/List'
import { Config, Session } from '../types'
import loadEvents from './events'

export default async function createSession(
  app: App,
  config: Config,
  extensions: string[]
): Promise<Session> {
  const partialSession: Partial<Session> = {
    app,
    config,
    extensions,
    menu: new Menu(),
  }
  partialSession.background = background(partialSession as Session)
  partialSession.api = await Api(partialSession as Session)
  partialSession.windows = new WindowsList(partialSession as Session)
  partialSession.driver = Driver(partialSession as Session)
  const session = partialSession as Session
  // Creating the window and pointing it at the SIDE extension URL
  const ideWindow = await session.api.windows.create()
  const ideWindowEntry = session.windows.read(ideWindow.id)
  const builtExtensions =
    await ideWindowEntry.window.webContents.session.getAllExtensions()
  await session.api.tabs.create(null, {
    active: true,
    url: `${builtExtensions[0].url}index.html`,
    windowId: ideWindow.id,
  })

  loadEvents(session)

  return session
}
