import client from './client'
import events from './events'
import server from './server'
import { Api } from '../../types'

const api: Api = {
  client,
  events,
  server,
}

export default api
