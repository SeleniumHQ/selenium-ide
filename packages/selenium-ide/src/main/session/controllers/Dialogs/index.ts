import { dialog } from 'electron'

export default class DialogsController {
  async open() {
    return await dialog.showOpenDialog({ properties: ['openFile'] })
  }
  async confirm(
    options: Electron.MessageBoxOptions = {
      message: 'Are you sure?',
      buttons: ['Cancel', 'Confirm'],
    }
  ): Promise<boolean> {
    const { response } = await dialog.showMessageBox(options)
    const confirmed = response === 1
    return confirmed
  }
  async openSave() {
    return await dialog.showSaveDialog({})
  }
}
