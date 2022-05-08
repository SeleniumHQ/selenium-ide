import { dialog } from 'electron'
import { Session } from 'main/types'

let firstTime = true
export default class SystemController {
  constructor(session: Session) {
    this.session = session
  }
  isDown: boolean = true
  async startup() {
    if (this.isDown) {
      // await this.session.windows.open('chromedriver')
      await this.session.driver.startProcess()
      await this.session.projects.select(firstTime)
      this.isDown = false
      firstTime = false
    }
  }
  async shutdown() {
    if (!this.isDown) {
      const confirm = await this.session.projects.onProjectUnloaded()
      if (confirm) {
        await this.session.driver.stopProcess()
        this.isDown = true
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
    this.session.app.quit()
  }
  session: Session
}
