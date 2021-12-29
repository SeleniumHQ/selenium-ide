import { Session } from 'main/types'
import Commands from '@seleniumhq/side-model/dist/Commands'

export default class CommandsController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async init() {
    this.session.state.state.commands = Commands
    return Commands
  }
}
