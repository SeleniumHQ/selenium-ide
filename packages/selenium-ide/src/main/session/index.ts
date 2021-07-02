import { App } from 'electron'
import Api from '../polyfill'
import background from './background'
import Driver from './driver'
import Windows from './windows'
import { Config, Session } from '../types'

export default async function createSession(
  app: App,
  config: Config,
  extensions: string[]
): Promise<Session> {
  const session: Partial<Session> = {
    app,
    config,
    extensions,
  }
  session.background = background(session as Session)
  session.api = await Api(session as Session)
  session.windows = await Windows(session as Session)
  session.driver = Driver(session as Session)
  // Creating the window and pointing it at the SIDE extension URL
  const ideWindow = await session.api.windows.create()
  const ideWindowEntry = session.windows.read(ideWindow.id)
  const builtExtensions =
    await ideWindowEntry.window.webContents.session.getAllExtensions()
  await session.api.tabs.create({
    url: `${builtExtensions[0].url}index.html`,
    windowId: ideWindow.id,
  })

  return session as Session
}
