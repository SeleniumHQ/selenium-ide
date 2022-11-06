import { loadPlugins, PluginShape } from '@seleniumhq/side-runtime'
import { ipcMain } from 'electron'
import storage from 'main/store'
import { sep } from 'path'
import BaseController from '../Base'

export type PluginMessageHandler = (
  event: Electron.IpcMainEvent,
  ...args: any[]
) => void

export type PluginHooksState = Record<string, PluginMessageHandler>

export default class PluginsController extends BaseController {
  plugins: PluginShape[] = []
  pluginHooks: PluginHooksState[] = []
  async list() {
    const systemPlugins = storage.get<'plugins'>('plugins')
    const project = await this.session.projects.getActive()
    return systemPlugins.concat(project.plugins)
  }
  async onProjectLoaded() {
    const projectPath = this.session.projects.filepath as string
    const pluginPaths = await this.list()
    const plugins = await loadPlugins(
      projectPath.split(sep).slice(0, -1).join(sep),
      pluginPaths,
      __non_webpack_require__
    )
    plugins.forEach((plugin, index) => {
      const pluginPath = pluginPaths[index]
      return this.load(pluginPath, plugin)
    })
  }
  async onProjectUnloaded() {
    this.plugins.forEach((plugin) => {
      return this.unload(plugin)
    })
  }
  async load(pluginPath: string, plugin: PluginShape) {
    this.plugins.push(plugin)
    const index = this.plugins.length - 1
    this.pluginHooks[index] = {}
    Object.entries(plugin.hooks).forEach(([event, hook]) => {
      const key = event === 'onMessage' ? `message-${pluginPath}` : event
      const handler: PluginMessageHandler = (_event, ...args) => hook(...args)
      ipcMain.on(key, handler)
      this.pluginHooks[index][key] = handler
    })
  }

  async unload(plugin: PluginShape) {
    const index = this.plugins.indexOf(plugin)
    this.plugins.splice(index, 1)
    const [hooks] = this.pluginHooks.splice(index, 1)
    Object.entries(hooks).forEach(([key, handler]) => {
      ipcMain.off(key, handler)
    })
  }
  // This needs to build before commands
  priority = 3
}
