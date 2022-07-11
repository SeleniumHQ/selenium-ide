import path from 'path'
import { CustomCommandShape, PluginShape } from './types'

export const correctPluginPaths = (
  projectPath: string,
  plugins: string[]
): string[] => {
  const projectDir = projectPath.split(path.sep).slice(0, -1).join(path.sep)
  return plugins.map((pluginPath) =>
    pluginPath.startsWith('.') ? path.join(projectDir, pluginPath) : pluginPath
  )
}

export const loadPlugins = async (
  pluginPaths: string[],
  importer?: (fileOrModule: string) => any
): Promise<PluginShape[]> =>
  Promise.all(
    pluginPaths.map(async (pluginPath) => {
      console.debug('Loading plugin from path...', pluginPath)
      let pluginFile = importer
        ? await importer(pluginPath)
        : await import(pluginPath)
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
    {} as Record<string, CustomCommandShape>
  )
