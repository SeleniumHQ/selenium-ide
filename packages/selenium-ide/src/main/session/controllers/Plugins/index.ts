import { PluginShape } from '@seleniumhq/side-api'
import { correctPluginPaths, loadPlugins } from '@seleniumhq/side-runtime'
import { ipcMain } from 'electron'
import storage from 'main/store'
import BaseController from '../Base'
import path from 'node:path'

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
    const projectPath = this.session.projects.filepath as string
    const activeProject = await this.session.projects.getActive()
    return systemPlugins
      .concat(correctPluginPaths(projectPath, activeProject.plugins))
  }

  async listPreloadPaths() {
    const list = await this.list();
    return list.map((pluginPath) => {
      const actualPluginPath = __non_webpack_require__.resolve(pluginPath)
      const preloadPath = path.join(actualPluginPath, '..', 'preload', 'index.js')
      return preloadPath
    })
  }

  async onProjectLoaded() {
    const pluginPaths = await this.list()
    const plugins = await loadPlugins(
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
    Object.entries(plugin?.hooks ?? {}).forEach(([event, hook]) => {
      const key = event === 'onMessage' ? `message-${pluginPath}` : event
      const handler: PluginMessageHandler = (_event, ...args) => hook(...args)
      ipcMain.on(key, handler)
      this.pluginHooks[index][key] = handler
    })
    if (plugin.hooks?.onLoad) {
      await plugin.hooks.onLoad(this.session.api)
    }
  }

  async unload(plugin: PluginShape) {
    const index = this.plugins.indexOf(plugin)
    this.plugins.splice(index, 1)
    const [hooks] = this.pluginHooks.splice(index, 1)
    Object.entries(hooks).forEach(([key, handler]) => {
      ipcMain.off(key, handler)
    })
    if (plugin.hooks?.onUnload) {
      await plugin.hooks.onUnload(this.session.api)
    }
  }
  // This needs to build before commands
  priority = 3
}
