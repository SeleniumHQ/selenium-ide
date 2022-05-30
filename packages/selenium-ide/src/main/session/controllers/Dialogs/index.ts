import { dialog } from 'electron'
import BaseController from '../Base'

/**
 * This provides convenience methods for menu opening, but we treat
 * it as an API so that the frontend react is clean
 */
export default class DialogsController extends BaseController {
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
}
