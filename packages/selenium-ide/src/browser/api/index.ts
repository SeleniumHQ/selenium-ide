import { process as processApi } from '@seleniumhq/side-api'
import { Api } from '@seleniumhq/side-api'
import EventListener from './classes/EventListener'
import Handler from './classes/Handler'

/**
 * This Converts the chrome API type to something usable
 * from the front end
 */

const api: Api = processApi((path: string) => {
  const trailingSegment: string = path.split('.').pop() as string
  if (trailingSegment.startsWith('on')) {
    return EventListener()(path)
  }
  return Handler()(path)
})

export default api
