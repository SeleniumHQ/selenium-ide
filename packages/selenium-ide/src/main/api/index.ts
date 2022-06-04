import { Api, ApiOverrides, process as processAPI } from '@seleniumhq/side-api'
import merge from 'lodash/fp/merge'
import EventListener from './classes/EventListener'
import Handler from './classes/Handler'
import RawHandler from './classes/RawHandler'
import { Session } from 'main/types'

export const apiOverrides: ApiOverrides<Api> = {
  recorder: {
    getFrameLocation: RawHandler<Session['recorder']['getFrameLocation']>(),
  },
}

export type MainApi = Api & {
  recorder: Api['recorder'] & {
    getFrameLocation: Session['recorder']['getFrameLocation']
  }
}

export default (session: Session): MainApi => {
  const baseApi: Api = processAPI((path, entry) => {
    const segments = path.split('.')
    const namespace: keyof Api = segments[0] as keyof Api
    const command = segments[1] as string
    // @ts-expect-error indexing nested types is a pain
    if (apiOverrides?.[namespace]?.[command]) {
      return
    }
    if (command.startsWith('on')) {
      return EventListener()(path, session, entry.mutator)
    }
    return Handler()(path, session, entry.mutator)
  })

  const mainApi: MainApi = merge(baseApi, apiOverrides)
  return mainApi
}
