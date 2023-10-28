import { Menu } from 'electron'
import { Session } from 'main/types'
import { editBasicsCommands } from './editBasics'
import { projectEditorCommands } from './projectEditor'
import { testEditorCommands } from './testEditor'
import { projectViewCommands } from './projectView'
import { platform } from 'os'
import helpMenu from './help'

const applicationMenu = (session: Session) => async () =>
  Menu.buildFromTemplate([
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
      submenu: await projectEditorCommands(session)(),
    },
    {
      label: '&Edit',
      submenu: [
        ...(await editBasicsCommands(session)()),
        ...(await testEditorCommands(session)()),
      ],
    },
    {
      label: '&View',
      submenu: await projectViewCommands(session)(),
    },
    {
      label: '&Help',
      submenu: await helpMenu(session)(),
    },
  ])

export default applicationMenu
