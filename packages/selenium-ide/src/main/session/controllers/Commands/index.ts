import Commands from '@seleniumhq/side-model/dist/Commands'
import { CustomCommandShape, PluginShape } from '@seleniumhq/side-runtime'
import BaseController from '../Base'

const serializeCustomCommands = (commands: PluginShape['commands'] = {}) =>
  Object.fromEntries(
    Object.entries(commands).map(([key, { execute: _execute, ...command }]) => [
      key,
      { ...command },
    ])
  )
/**
 * This holds on to all commands currently in the command map.
 * It's primarily instrumented by loading plugins
 */
export default class CommandsController extends BaseController {
  customCommands: PluginShape['commands'] = {}
  async onProjectLoaded() {
    this.customCommands = this.session.plugins.plugins.reduce(
      (commands, plugin) => ({
        ...commands,
        ...(plugin.commands || {}),
      }),
      {} as Record<string, CustomCommandShape>
    )
    this.session.state.state.commands = {
      ...Commands,
      ...serializeCustomCommands(this.customCommands),
    }
  }
  // This needs to build after plugins
  priority = 5
}
