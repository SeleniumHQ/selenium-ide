import { MenuComponent, Session } from 'main/types'
import { commands as editBasicsCommands } from './editBasics'
import { commands as projectEditorCommands } from './projectEditor'
import { commands as testEditorCommands } from './testEditor'
import { commands as projectViewCommands } from './projectView'
import { platform } from 'os'
import { commands as helpMenuCommands } from './help'
import { menuFactoryFromCommandFactory } from '../utils'

export const commands: MenuComponent = (session: Session) => () => [
  {
    label: 'Selenium IDE',
    submenu: [
      {
        label: session.system.languageMap.electronMenuTree.about,
        role: 'about',
      },
      { type: 'separator' },
      {
        label: session.system.languageMap.electronMenuTree.services,
        role: 'services',
      },
      { type: 'separator' },
      {
        label: session.system.languageMap.electronMenuTree.hideElectron,
        role: 'hide',
      },
      {
        label: session.system.languageMap.electronMenuTree.hideOthers,
        role: 'hideOthers',
      },
      {
        label: session.system.languageMap.electronMenuTree.showAll,
        role: 'unhide',
      },
      { type: 'separator' },
      {
        accelerator: platform() === 'win32' ? 'Alt+F4' : 'CommandOrControl+Q',
        label: session.system.languageMap.electronMenuTree.quit,
        click: async () => {
          await session.system.quit()
        },
      },
    ],
  },
  {
    label: session.system.languageMap.windowTab.file,
    submenu: projectEditorCommands(session)(),
  },
  {
    label: session.system.languageMap.windowTab.edit,
    submenu: [
      ...editBasicsCommands(session)(),
      ...testEditorCommands(session)(),
    ],
  },
  {
    label: session.system.languageMap.windowTab.view,
    submenu: projectViewCommands(session)(),
  },
  {
    label: session.system.languageMap.windowTab.help,
    submenu: helpMenuCommands(session)(),
  },
]

export default menuFactoryFromCommandFactory(commands)
