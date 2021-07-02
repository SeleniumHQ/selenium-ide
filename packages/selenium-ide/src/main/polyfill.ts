import processPolyfill from 'polyfill/process'
import { Polyfill } from 'polyfill/index'
import { Session } from './types'

export type MainPolyfillMapper = {
  [NS in keyof Polyfill]: {
    [P in keyof Polyfill[NS]]: ReturnType<Polyfill[NS][P]['main']>
  }
}

export default (session: Session) =>
  processPolyfill<MainPolyfillMapper>((name, handler) => {
    if (handler.main) {
      return handler.main(name, session)
    }
  })
