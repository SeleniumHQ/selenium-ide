import { MenuComponent, Session } from 'main/types'
import { commands as editBasicsCommands } from './editBasics'
import { commands as projectEditorCommands } from './projectEditor'
import { commands as testEditorCommands } from './testEditor'
import { commands as projectViewCommands } from './projectView'
import { platform } from 'os'
import { commands as helpMenuCommands } from './help'
import { menuFactoryFromCommandFactory } from '../utils'

export const commands: MenuComponent = (session: Session) => () =>
  [
    {
      label: 'Selenium IDE',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        {
          accelerator: platform() === 'win32' ? 'Alt+F4' : 'CommandOrControl+Q',
          label: 'Quit',
          click: async () => {
            await session.system.quit()
          },
        },
      ],
    },
    {
      label: '&File',
      submenu: projectEditorCommands(session)(),
    },
    {
      label: '&Edit',
      submenu: [
        ...(editBasicsCommands(session)()),
        ...(testEditorCommands(session)()),
      ],
    },
    {
      label: '&View',
      submenu: projectViewCommands(session)(),
    },
    {
      label: '&Help',
      submenu: helpMenuCommands(session)(),
    },
  ]

export default menuFactoryFromCommandFactory(commands)