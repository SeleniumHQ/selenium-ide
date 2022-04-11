import { loadPlugins, PluginShape } from '@seleniumhq/side-runtime'
import { ipcMain } from 'electron'
import storage from 'main/store'
import { Session } from 'main/types'
import { join } from 'path'

export default class PluginsController {
  constructor(session: Session) {
    this.session = session
    this.plugins = []
  }
  plugins: PluginShape[]
  session: Session
  async attach(filepath: string) {
    const plugins = storage.get<'plugins'>('plugins', [])
    if (plugins.indexOf(filepath) !== -1) return true
    storage.set<'plugins'>('plugins', plugins.concat(filepath))
    return true
  }
  async detach(filepath: string) {
    const plugins = storage.get<'plugins'>('plugins', [])
    const index = plugins.indexOf(filepath)
    if (index === -1) return true
    storage.set<'plugins'>('plugins', plugins.splice(index, 1))
    return true
  }
  async list() {
    const systemPlugins = storage.get<'plugins'>('plugins')
    const project = await this.session.projects.getActive()
    const projectPath = this.session.projects.filepath as string
    const projectPlugins = project.plugins.map((p) =>
      p.startsWith('.') ? join(projectPath, p) : p
    )
    // .plugins.map((pluginPath) => pluginPath.starts)
    return systemPlugins.concat(projectPlugins)
  }
  async onProjectLoaded() {
    const projectPath = this.session.projects.filepath as string
    const pluginPaths = await this.list()
    const plugins = loadPlugins(
      __non_webpack_require__,
      projectPath,
      await this.session.projects.getActive()
    )
    plugins.forEach((plugin, index) => {
      const pluginPath = pluginPaths[index]
      return this.run(pluginPath, plugin)
    })
  }
  async run(pluginPath: string, plugin: PluginShape) {
    this.plugins.push(plugin)
    const onMessage = plugin.hooks.onMessage
    if (onMessage) {
      ipcMain.on(`message-${pluginPath}`, (_event, ...args) =>
        onMessage(...args)
      )
    }
  }
}
