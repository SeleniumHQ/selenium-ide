import { Session } from 'main/types'
import Commands from '@seleniumhq/side-model/dist/Commands'
import { PluginShape } from '@seleniumhq/side-runtime'

const serializeCustomCommands = (commands: PluginShape['commands'] = {}) =>
  Object.fromEntries(
    Object.entries(commands).map(([key, { execute: _execute, ...command }]) => [
      key,
      { ...command },
    ])
  )
export default class CommandsController {
  constructor(session: Session) {
    this.session = session
    this.customCommands = {}
  }
  customCommands: PluginShape['commands']
  session: Session
  async onProjectLoaded() {
    this.customCommands = this.session.plugins.plugins.reduce(
      (commands, plugin) => ({
        ...commands,
        ...plugin.commands,
      }),
      {}
    )
    this.session.state.state.commands = {
      ...Commands,
      ...serializeCustomCommands(this.customCommands),
    }
  }
}
