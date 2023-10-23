import { dialog } from 'electron'
import BaseController from '../Base'
import { isAutomated } from 'main/util'

let firstTime = true
export default class SystemController extends BaseController {
  isDown = true
  shuttingDown = false

  async getLogPath() {
    return this.session.app.getPath('logs')
  }
  async startup() {
    if (this.isDown) {
      await this.session.windows.open('logger')
      // If automated, assume we already have a chromedriver process running
      if (!isAutomated) {
        const startupError = await this.session.driver.startProcess()
        if (startupError) {
          await this.crash(
            `Unable to startup due to chromedriver error: ${startupError}`
          )
        }
      }
      await this.session.projects.select(firstTime)
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
    await this.quit()
    throw new Error(error)
  }

  async beforeQuit() {
    await this.shutdown()
    await this.session.windows.closeAll()
  }

  async quit() {
    this.beforeQuit()
    if (this.isDown) {
      this.session.app.quit()
    }
  }
}
