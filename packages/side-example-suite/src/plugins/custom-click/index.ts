import { PluginShape } from '@seleniumhq/side-api'

/**
 * This is a demo plugin that takes the default click command, adds a new "customClick" command,
 * and replaces recordings of the default click command with the custom one.
 * This plugin also adds a hook that logs the command before it is executed.
 */

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
        await driver.doClick(command.target as string, command.value || '')
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
