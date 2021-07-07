import processPolyfill from 'polyfill/process'
import { Polyfill } from 'polyfill/index'
import { Session } from 'main/types'

export type MainPolyfillMapper = {
  [Namespace in keyof Polyfill]: {
    [Handler in keyof Polyfill[Namespace]]: ReturnType<
      Polyfill[Namespace][Handler]['main']
    >
  }
}

export default (session: Session) =>
  processPolyfill<MainPolyfillMapper>((name, handler) => {
    if (handler.main) {
      return handler.main(name, session)
    }
  })
