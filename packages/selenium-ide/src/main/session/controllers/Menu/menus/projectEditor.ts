import { MenuComponent } from 'main/types'
import { menuFactoryFromCommandFactory } from '../utils'

export const commands: MenuComponent = (session) => () => [
  {
    accelerator: 'CommandOrControl+N',
    label: session.system.languageMap.fileMenuTree.newProject,
    click: async () => {
      await session.api.projects.new()
    },
  },
  { type: 'separator' },
  {
    accelerator: 'CommandOrControl+O',
    label: session.system.languageMap.fileMenuTree.loadProject,
    click: async () => {
      const response = await session.dialogs.open()
      if (response.canceled) return
      await session.api.projects.load(response.filePaths[0])
    },
  },
  {
    accelerator: 'CommandOrControl+R',
    label: session.system.languageMap.fileMenuTree.recentProjects,
    click: async () => {
      await session.projects.showRecents()
    },
    submenu: session.projects.getRecent().map((project) => ({
      click: async () => {
        await session.api.projects.load(project)
      },
      label: project,
    })),
  },
  { type: 'separator' },
  {
    accelerator: 'CommandOrControl+S',
    label: session.system.languageMap.fileMenuTree.saveProject,
    click: async () => {
      await session.projects.save(session.projects.filepath as string)
    },
    enabled: Boolean(session.projects.filepath),
  },
  {
    accelerator: 'CommandOrControl+Shift+S',
    label: session.system.languageMap.fileMenuTree.saveProjectAs,
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

export default menuFactoryFromCommandFactory(commands)
