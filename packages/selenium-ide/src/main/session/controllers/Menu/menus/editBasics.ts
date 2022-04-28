import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'

export const editBasicsCommands: MenuComponent = () => async () =>
  [
    { label: 'Undo', role: 'undo' },
    { label: 'Redo', role: 'redo' },
    { type: 'separator' },
    { label: 'Cut', role: 'cut' },
    { label: 'Copy', role: 'copy' },
    { label: 'Paste', role: 'paste' },
  ]

const editBasicsMenu = (session: Session) => async () => {
  const menuItems = await editBasicsCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default editBasicsMenu
