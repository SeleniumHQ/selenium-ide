import { Api, processApi } from '@seleniumhq/side-api'
import { Session } from 'main/types'
import EventListener from './classes/EventListener'
import Handler from './classes/Handler'
import RawHandler from './classes/RawHandler'

export const overrides = {
  recorder: {
    getFrameLocation: RawHandler<Session['recorder']['getFrameLocation']>(),
  }
} as const

export type MainApi = Api & {
  recorder: {
    getFrameLocation: Session['recorder']['getFrameLocation']
  }
}

export default (session: Session): MainApi => ({
  ...processApi((path, handler) => {
    const [namespace, command] = path.split('.') as [keyof Api, string]
    // @ts-expect-error dunno dont care
    if (overrides?.[namespace]?.[command]) {
      // @ts-expect-error dunno dont care
      return overrides[namespace][command](path, session, handler.mutator);
    }
    if (command.startsWith('on')) {
      return EventListener()(path, session, handler.mutator)
    }
    return Handler()(path, session, handler.mutator)
  })
})
