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
        await session.api.projects.load(response.filePaths[0])
      },
    },
    {
      accelerator: 'CommandOrControl+R',
      label: 'Recent Projects',
      click: async () => {
        await session.projects.showRecents()
      },
      submenu: (await session.projects.getRecent()).map((project) => ({
        click: async () => {
          await session.api.projects.load(project)
        },
        label: project,
      })),
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
    {
      label: 'Export Project As...',
      submenu: [
        {
          label: 'C# Commons',
          click: async () => {
          },
        },
        {
          label: 'C# NUnit',
          click: async () => {
          },
        },
        {
          label: 'C# XUnit',
          click: async () => {
          },
        },
        {
          label: 'Java JUnit',
          click: async () => {
          },
        },
        {
          label: 'Javascript Mocha',
          click: async () => {
          },
        },
        {
          label: 'Python Pytest',
          click: async () => {
          },
        },
        {
          label: 'Ruby RSpec',
          click: async () => {
          },
        },
      ],
    },
  ]

const projectEditorMenu = (session: Session) => async () => {
  const menuItems = await projectEditorCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default projectEditorMenu
