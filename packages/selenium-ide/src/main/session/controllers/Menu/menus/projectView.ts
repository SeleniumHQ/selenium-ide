import { BrowserWindow } from 'electron'
import { MenuComponent } from 'main/types'
import { platform } from 'os'
import { menuFactoryFromCommandFactory, multipleCommand } from '../utils'

export const commands: MenuComponent = (session) => () => [
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
      label: session.system.languageMap.viewMenuTree.showDevTools,
    }
  ),
  {
    accelerator: 'CommandOrControl+P',
    click: async () => {
      await session.windows.initializePlaybackWindow()
    },
    label: session.system.languageMap.viewMenuTree.resetPlaybackWindows,
  },
  {
    accelerator: 'CommandOrControl+R',
    label: session.system.languageMap.viewMenuTree.refreshPlaybackWindow,
    click: async () => {
      const window = await session.windows.getActivePlaybackWindow()
      if (window) {
        await window.webContents.executeJavaScript('window.location.reload()')
        if (session.state.state.status === 'recording') {
          await session.api.recorder.recordNewCommand(
            {
              command: 'executeScript',
              comment: 'Reload the page',
              target: 'window.location.reload()',
              value: '',
            },
            true
          )
        }
      }
    },
  },
]

export default menuFactoryFromCommandFactory(commands)
