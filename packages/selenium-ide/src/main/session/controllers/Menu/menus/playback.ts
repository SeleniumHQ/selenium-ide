import { BrowserWindow } from 'electron'
import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'
import { platform } from 'os'
import { multipleCommand } from '../utils'

export const playbackCommands: MenuComponent = (session) => async () =>
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

const playbackMenu = (session: Session) => async () => {
  const menuItems = await playbackCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default playbackMenu
