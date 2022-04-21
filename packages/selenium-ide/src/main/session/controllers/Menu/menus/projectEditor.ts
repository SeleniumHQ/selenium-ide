import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'

export const projectEditorCommands: MenuComponent = (session) => async () =>
  [
    {
      accelerator: 'CommandOrControl+N',
      label: 'New Project',
      click: async () => {
        await session.projects.new()
      },
    },
    { type: 'separator' },
    {
      accelerator: 'CommandOrControl+O',
      label: 'Load Project',
      click: async () => {
        const response = await session.dialogs.open()
        if (response.canceled) return
//        await session.projects.close()
        await session.api.projects.load(response.filePaths[0])
      },
    },
    { type: 'separator' },
    {
      accelerator: 'CommandOrControl+S',
      label: 'Save Project',
      click: async () => {
        await session.projects.save(session.projects.filepath as string)
      },
      enabled: Boolean(session.projects.filepath),
    },
    {
      accelerator: 'CommandOrControl+Shift+S',
      label: 'Save Project As...',
      click: async () => {
        const response = await session.dialogs.openSave()
        if (response.canceled) return
        let filePath = response.filePath as string
        if (!filePath.endsWith('.side')) {
          filePath = `${filePath}.side`
        }
        await session.projects.save(filePath)
      },
    },
  ]

const projectEditorMenu = (session: Session) => async () => {
  const menuItems = await projectEditorCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default projectEditorMenu
