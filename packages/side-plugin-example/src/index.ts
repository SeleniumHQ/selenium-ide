import { PluginShape } from '@seleniumhq/side-runtime'

const plugin: PluginShape = {
  commands: {
    exampleCommand: {
      name: 'Example command',
      description:
        'This command exists as an example of what these commands can do',
      target: {
        name: 'locator',
        description: 'This is the locator used by the custom command',
      },
      execute: async (_command, _driver) => true,
    },
  },
  hooks: {
    onAfterCommand: (input) => {
      console.log('After command', input)
    },
    onBeforeCommand: (input) => {
      console.log('Before command', input)
    },
  },
}

export default plugin
