import { PluginPreloadShape } from '@seleniumhq/side-runtime'

export let clickCount = 0
export type SendMessage = (...args: any[]) => void

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
