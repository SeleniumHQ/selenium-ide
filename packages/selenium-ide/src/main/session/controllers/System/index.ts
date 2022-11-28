import { dialog } from 'electron'
import BaseController from '../Base'

let firstTime = true
export default class SystemController extends BaseController {
  isDown = true
  shuttingDown = false

  async getLogPath() {
    return this.session.app.getPath('logs')
  }
  async startup() {
    if (this.isDown) {
      const startupError = await this.session.driver.startProcess()
      if (startupError) {
        await this.crash(`Unable to startup due to chromedriver error: ${startupError}`);
      }
      await this.session.projects.select(firstTime)
      await this.session.windows.open('logger')
      this.isDown = false
      firstTime = false
    }
  }
  async shutdown() {
    if (!this.isDown) {
      if (!this.shuttingDown) {
        this.shuttingDown = true
        const confirm = await this.session.projects.onProjectUnloaded()
        if (confirm) {
          await this.session.driver.stopProcess()
          this.isDown = true
        }
        this.shuttingDown = false
      }
    }
  }
  async crash(error: string) {
    await dialog.showMessageBox({
      message: error,
      type: 'error',
    })
    await this.shutdown()
    await this.quit()
  }
  async quit() {
    await this.shutdown()
    if (this.isDown) {
      this.session.app.quit()
    }
  }
}
