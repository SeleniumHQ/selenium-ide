import client from './client'
import events from './events'
import server from './server'

export interface ClientApi {
  client: typeof client
  events: typeof events
  server: typeof server
}

const api: ClientApi = {
  client,
  events,
  server,
}

export default api
