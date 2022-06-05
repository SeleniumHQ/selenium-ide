import type { Api } from '@seleniumhq/side-api'
import { processApi } from '@seleniumhq/side-api'
import EventListener from './classes/EventListener'
import Handler from './classes/Handler'

const api: Api = processApi((path: string) => {
  const trailingSegment: string = path.split('.').pop() as string
  if (trailingSegment.startsWith('on')) {
    return EventListener()(path)
  }
  return Handler()(path)
})

export { Api } from '@seleniumhq/side-api'

export default api
