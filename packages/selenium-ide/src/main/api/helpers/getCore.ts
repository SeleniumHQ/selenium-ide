import { CoreSessionData } from '@seleniumhq/side-api/dist/types'
import { Session } from 'main/types'

export default (session: Session): CoreSessionData => ({
  project: session.projects.project,
  state: session.state.state,
})
