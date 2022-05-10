import { BrowserWindow } from 'electron'
import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'
import { platform } from 'os'
import { multipleCommand } from '../utils'

export const projectViewCommands: MenuComponent = (session) => async () =>
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

const projectViewMenu = (session: Session) => async () => {
  const menuItems = await projectViewCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default projectViewMenu
