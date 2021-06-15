import { ipcMain } from 'electron'
import client from './client'
import server from './server'
import { Session } from '../../types/server'
import events from './events'

export type ServerApi = {
  client: ReturnType<typeof client>
  events: ReturnType<typeof events>
  server: ReturnType<typeof server>
}

export default ApiFactory

function ApiFactory(session: Session): ServerApi {
  // Ensure a blank slate beforehand
  ipcMain.removeAllListeners()
  return {
    client: client(session),
    events: events(session),
    server: server(session),
  }
}
