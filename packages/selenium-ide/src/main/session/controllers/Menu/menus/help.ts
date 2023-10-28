import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'

export const HelpCommands: MenuComponent = (session) => async () =>
  [
    {
      accelerator: 'CommandOrControl+Shift+D',
      click: async () => {
        await session.system.dumpSession()
      },
      label: 'Dump Session To File',
    },
  ]

const helpMenu = (session: Session) => async () => {
  const menuItems = await HelpCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default helpMenu
