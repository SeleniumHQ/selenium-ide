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
        await driver.doClick(command.target!, command.value!, command)
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
    async onLoad(api) {
      console.log('Loading example plugin!')
      api.channels.onSend.addListener((channel, command) => {
        if (channel === 'example-plugin') {
          console.log('Message received', channel, command)
        }
      })
      console.log('Loaded example plugin!')
    },
  },
}

export default plugin
