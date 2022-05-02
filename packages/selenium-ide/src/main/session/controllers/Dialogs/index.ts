import { dialog } from 'electron'

export default class DialogsController {
  async open() {
    return await dialog.showOpenDialog({ properties: ['openFile'] })
  }
  async showMessageBox(
    message: string,
    buttons: string[]
  ): Promise<number>
  {
    const { response } = await dialog.showMessageBox({ message, buttons })
    return response
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
  // async promptSave(
  //   options: Electron.MessageBoxOptions = {
  //     message: 'Save changes to current project?',
  //     buttons: ['Yes', 'No'],
  //   }
  // ): Promise<boolean> {
  //   const { response } = await dialog.showMessageBox(options)
  //   const confirmed = response === 0
  //   return confirmed
  // }
}
