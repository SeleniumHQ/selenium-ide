import { Menu } from 'electron'
import { Session } from 'main/types'

export default class MenuController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  onProjectLoaded() {
    const applicationMenu = Menu.buildFromTemplate([
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
        submenu: [
          {
            accelerator: 'CommandOrControl+N',
            label: 'New Project',
            click: async () => {
              await this.session.projects.new()
            },
          },
          { type: 'separator' },
          {
            accelerator: 'CommandOrControl+O',
            label: 'Load Project',
            click: async () => {
              const response = await this.session.dialogs.open()
              if (response.canceled) return
              await this.session.projects.close()
              await this.session.api.projects.load(response.filePaths[0])
            },
          },
          { type: 'separator' },
          {
            accelerator: 'CommandOrControl+S',
            label: 'Save Project',
            click: async () => {
              await this.session.projects.save(
                this.session.projects.filepath as string
              )
            },
            enabled: Boolean(this.session.projects.filepath),
          },
          {
            accelerator: 'CommandOrControl+Shift+S',
            label: 'Save Project As...',
            click: async () => {
              const response = await this.session.dialogs.openSave()
              if (response.canceled) return
              let filePath = response.filePath as string
              if (!filePath.endsWith('.side')) {
                filePath = `${filePath}.side`
              }
              await this.session.projects.save(filePath)
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        ],
      },
    ])
    Menu.setApplicationMenu(applicationMenu)
  }
}
