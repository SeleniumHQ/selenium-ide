import { ProjectShape } from '@seleniumhq/side-model'
import { join } from 'path'
import { CustomCommandShape, PluginShape } from './types'

export const loadPlugins = (
  importer: NodeRequire,
  projectPath: string,
  project: ProjectShape
): PluginShape[] => {
  return project.plugins.map((pluginPath) => {
    const correctedPluginPath = pluginPath.startsWith('.')
      ? join(projectPath, pluginPath)
      : pluginPath
    const pluginFile = importer(correctedPluginPath)
    const plugin = pluginFile.default ? pluginFile.default : pluginFile
    return plugin
  })
}

export const getCustomCommands = (
  plugins: PluginShape[]
): Record<string, CustomCommandShape> =>
  plugins.reduce(
    (commands, plugin) => ({
      ...commands,
      ...plugin.commands,
    }),
    {}
  )
