import { PluginPreloadShape, SendMessage } from '@seleniumhq/side-api'

export let clickCount = 0

/**
 * This is the preload script for the plugin. It runs in the browser context
 * and can be used to add event listeners, etc.
 *
 * NOTE: As this runs during the Electron preload phase, this is completely
 * invisible to the consuming site. You can still do whatever you want to the
 * DOM and such, but nothing outside can get in without using the existing hooks
 * or the underlying electron APIs.
 */

const preloadPlugin: PluginPreloadShape = (sendMessage: SendMessage) => {
  document.addEventListener('click', () => {
    clickCount += 1
  })
  return {
    hooks: {
      onCommandRecorded: (command, event) => {
        console.debug('Recorded command', command, event)
        if (command.command !== 'click') return
        sendMessage('Click!')
        return {
          action: 'update',
          command: {
            ...command,
            command: 'customClick',
          },
        }
      },
    },
  }
}

export default preloadPlugin
