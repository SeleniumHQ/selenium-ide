import { Session } from 'main/types'
import Commands, { CommandTypes } from '@seleniumhq/side-model/dist/Commands'

export default class CommandsController {
  constructor(session: Session) {
    this.session = session
    this.commands = Commands
  }
  commands: CommandTypes
  session: Session
  async onProjectLoaded() {
    this.session.state.state.commands = this.commands
    return Commands
  }
}
