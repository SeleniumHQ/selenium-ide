import { ipcMain } from 'electron'
import client from './client'
import server from './server'
import { Api, Session } from '../../types'
import events from './events'

export default (session: Session): Api => {
  // Ensure a blank slate beforehand
  ipcMain.removeAllListeners()
  return {
    client: client(session),
    events: events(session),
    server: server(session),
  }
}
