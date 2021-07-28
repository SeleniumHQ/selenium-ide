import { Session } from 'main/types'
import ArgTypes from '@seleniumhq/side-model/dist/ArgTypes'

export default class ArgTypesController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async get() {
    return ArgTypes
  }
}
