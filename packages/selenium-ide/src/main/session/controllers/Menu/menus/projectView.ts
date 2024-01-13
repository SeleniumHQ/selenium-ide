import { BrowserWindow } from 'electron'
import { MenuComponent } from 'main/types'
import { platform } from 'os'
import { menuFactoryFromCommandFactory, multipleCommand } from '../utils'

export const commands: MenuComponent = (session) => () =>
  [
    ...multipleCommand(
      platform() === 'win32'
        ? ['CommandOrControl+Shift+I', 'CommandOrControl+F12', 'F12']
        : ['CommandOrControl+Option+I', 'CommandOrControl+F12'],
      {
        click: async () => {
          await session.state.get()
          const window = BrowserWindow.getFocusedWindow()
          window?.webContents.openDevTools()
        },
        label: 'Show DevTools',
      }
    ),
    {
      accelerator: 'CommandOrControl+P',
      click: async () => {
        await session.windows.initializePlaybackWindow()
      },
      label: 'Reset Playback Windows',
    },
  ]

export default menuFactoryFromCommandFactory(commands)
