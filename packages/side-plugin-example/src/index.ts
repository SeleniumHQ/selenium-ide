import { PluginShape } from '@seleniumhq/side-runtime'

const plugin: PluginShape = {
  commands: {
    customClick: {
      name: 'custom click',
      description:
        'This command should replace the standard click command when recording',
      target: {
        name: 'locator',
        description: 'The target of the original recorded click',
      },
      execute: async (command, driver) => {
        await driver.doClick(command.target as string)
      },
    },
  },
  hooks: {
    onAfterCommand: (input) => {
      console.log('After command', input)
    },
    onBeforeCommand: (input) => {
      console.log('Before command', input)
    },
    onMessage: (...args) => {
      console.log('Received message!', ...args)
    },
  },
}

export default plugin
