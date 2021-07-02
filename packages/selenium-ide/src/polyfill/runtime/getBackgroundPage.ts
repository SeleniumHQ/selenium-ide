import ProxyObject from 'browser/helpers/ProxyObject'
import { Session } from 'main/types'

export const main = (_path: string, session: Session) => () =>
  session.background

export const browser = ProxyObject<Session['background']>(
  'runtime.setBackgroundPage'
)
