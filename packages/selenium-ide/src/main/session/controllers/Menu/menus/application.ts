import { Menu } from 'electron'
import { Session } from 'main/types'
import { projectEditorCommands } from './projectEditor'
import { testEditorCommands } from './testEditor'

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
        { role: 'quit' },
      ],
    },
    {
      label: '&File',
      submenu: await projectEditorCommands(session)(),
    },
    {
      label: 'Edit',
      submenu: await testEditorCommands(session)(),
    },
  ])

export default applicationMenu
