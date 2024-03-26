import { Api, BaseListener, processApi } from '@seleniumhq/side-api'
import { Session } from 'main/types'
import EventListener, { MainListener } from './classes/EventListener'
import Handler from './classes/Handler'
import RawHandler from './classes/RawHandler'

export const overrides = {
  recorder: {
    getWinHandleId: RawHandler<Session['recorder']['getWinHandleId']>(),
    getFrameLocation: RawHandler<Session['recorder']['getFrameLocation']>(),
  },
  windows: {
    shiftFocus: RawHandler<Session['windows']['shiftFocus']>(),
  },
} as const

export type MainApi = {
  [NS in keyof Api]: {
    [K in keyof Api[NS]]: Api[NS][K] extends BaseListener<
      infer ARGS,
      infer RESULT
    >
      ? MainListener<ARGS, RESULT>
      : Api[NS][K]
  }
} & typeof overrides

export default (session: Session): MainApi => ({
  ...processApi((path, handler) => {
    const [namespace, command] = path.split('.') as [keyof Api, string]
    // @ts-expect-error dunno dont care
    if (overrides?.[namespace]?.[command]) {
      // @ts-expect-error dunno dont care
      return overrides[namespace][command](path, session, handler.mutator)
    }
    if (command.startsWith('on')) {
      return EventListener()(path, session, handler.mutator)
    }
    return Handler()(path, session, handler.mutator)
  }),
})
