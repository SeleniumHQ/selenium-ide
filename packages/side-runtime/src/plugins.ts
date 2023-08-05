import path from 'path'
import { Commands } from '@seleniumhq/side-model'
import { CustomCommandShape, PluginRuntimeShape } from './types'

export const correctPluginPaths = (
  projectPath: string,
  plugins: string[]
): string[] => {
  const projectDir = projectPath?.split(path.sep).slice(0, -1).join(path.sep)
  return plugins
    .filter((pluginPath) => {
      if (typeof pluginPath !== 'string') {
        console.warn('Skipping legacy style plugin ', pluginPath)
        return false
      }
      return true
    })
    .map((pluginPath) => {
      return pluginPath.startsWith('.')
        ? path.join(projectDir, pluginPath)
        : pluginPath
    })
}

export const loadPlugins = async (
  pluginPaths: string[],
  importer?: (fileOrModule: string) => any
): Promise<PluginRuntimeShape[]> =>
  Promise.all(
    pluginPaths.map(async (pluginPath) => {
      console.debug('Loading plugin from path...', pluginPath)
      let pluginFile = importer
        ? await importer(pluginPath)
        : await import(pluginPath)
      const plugin: PluginRuntimeShape = pluginFile.default
        ? pluginFile.default
        : pluginFile
      if (plugin) {
        Object.entries(plugin.commands || {}).forEach(([key, command]) => {
          Commands[key] = command
        })
      }
      return plugin
    })
  )

export const getCustomCommands = (
  plugins: PluginRuntimeShape[]
): Record<string, CustomCommandShape> =>
  plugins.reduce(
    (commands, plugin) => ({
      ...commands,
      ...plugin.commands,
    }),
    {} as Record<string, CustomCommandShape>
  )
