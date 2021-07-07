import { Session } from 'main/types'
import browserWindowCreated from './browser-window-created'

export default (session: Session) => ({
  browserWindowCreated: browserWindowCreated(session),
})
