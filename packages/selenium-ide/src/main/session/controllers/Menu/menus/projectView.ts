import { BrowserWindow } from 'electron'
import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'

export const projectViewCommands: MenuComponent = (session) => async () =>
  [
    {
      accelerator: 'CommandOrControl+F12',
      label: 'Show DevTools',
      click: async () => {
        await session.state.get()
        const window = BrowserWindow.getFocusedWindow()
        window?.webContents.openDevTools()
      },
    },
    {
      accelerator: 'CommandOrControl+P',
      label: 'Reset Playback Windows',
      click: async () => {
        await session.windows.initializePlaybackWindow()
      }
    }
  ]

const projectViewMenu = (session: Session) => async () => {
  const menuItems = await projectViewCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default projectViewMenu
