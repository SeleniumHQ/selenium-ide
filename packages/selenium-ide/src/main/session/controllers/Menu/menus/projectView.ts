import { BrowserWindow } from 'electron'
import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'
import { platform } from 'os'

const devToolsAccelerators =
  platform() === 'win32'
    ? ['CommandOrControl+Shift+I', 'CommandOrControl+F12', 'F12']
    : ['CommandOrControl+Option+I', 'CommandOrControl+F12']
export const projectViewCommands: MenuComponent = (session) => async () =>
  [
    ...devToolsAccelerators.map((accelerator, index) => ({
      accelerator,
      label: 'Show DevTools',
      click: async () => {
        await session.state.get()
        const window = BrowserWindow.getFocusedWindow()
        window?.webContents.openDevTools()
      },
      visible: index === 0,
    })),
    {
      accelerator: 'CommandOrControl+P',
      label: 'Reset Playback Windows',
      click: async () => {
        await session.windows.initializePlaybackWindow()
      },
    },
  ]

const projectViewMenu = (session: Session) => async () => {
  const menuItems = await projectViewCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default projectViewMenu
