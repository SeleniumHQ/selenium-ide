import noop from 'lodash/fp/noop'
import processApi from 'api/process'
import { Api } from 'api/index'
import { CoreSessionData } from 'api/types'
import { Session } from 'main/types'
import getCore from './getCore'

export type APIMutators = {
  [Namespace in keyof Api]: {
    [Handler in keyof Api[Namespace]]: ReturnType<
      Api[Namespace][Handler]['mutator']
    >
  }
}

const getMutators = (session: Session) =>
  processApi<APIMutators>((name, handler) => {
    if (handler.mutator) {
      return handler.mutator(session)
    }
  })

export default (session: Session): => {

}
