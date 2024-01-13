import { BrowserWindow } from 'electron'
import { MenuComponent } from 'main/types'
import { platform } from 'os'
import { menuFactoryFromCommandFactory, multipleCommand } from '../utils'

export const commands: MenuComponent =
  (session) => () =>
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
      {
        accelerator: '1',
        label: 'Record Wait For Element Present',
      },
      {
        accelerator: '2',
        label: 'Record Wait For Element Visible',
      },
      {
        accelerator: '3',
        label: 'Record Wait For Element Text',
      },
      {
        accelerator: '4',
        label: 'Record Wait For Element Editable',
      },
    ]

export default menuFactoryFromCommandFactory(commands)
