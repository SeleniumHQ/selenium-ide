import { PluginShape } from '@seleniumhq/side-runtime'
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
    return storage.get<'plugins'>('plugins')
  }
  async onProjectLoaded() {
    const project = await this.session.projects.getActive()
    const baseProjectPath = this.session.projects.filepath as string
    const projectPlugins = project.plugins.filter(
      (pluginPath) => typeof pluginPath === 'string'
    )
    const systemPlugins = storage.get<'plugins'>('plugins', [])
    return projectPlugins.concat(systemPlugins).map((pluginPath) => {
      const correctedPluginPath = pluginPath.startsWith('.')
        ? join(baseProjectPath, pluginPath)
        : pluginPath
      return __non_webpack_require__(correctedPluginPath)
    })
  }
}
