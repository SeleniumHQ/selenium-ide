import path from 'path'
import { CustomCommandShape, PluginShape } from './types'

export const loadPlugins = async (
  projectPath: string,
  plugins: string[],
  importer?: (fileOrModule: string) => any
): Promise<PluginShape[]> =>
  Promise.all(
    plugins.map(async (pluginPath) => {
      const correctedPluginPath = pluginPath.startsWith('.')
        ? path.join(projectPath, pluginPath)
        : pluginPath
      console.debug('Loading plugin from path...', correctedPluginPath)
      let pluginFile = importer
        ? await importer(correctedPluginPath)
        : await import(correctedPluginPath)
      const plugin: PluginShape = pluginFile.default
        ? pluginFile.default
        : pluginFile
      console.debug('Loaded plugin successfully?', Boolean(plugin))
      return plugin
    })
  )

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
