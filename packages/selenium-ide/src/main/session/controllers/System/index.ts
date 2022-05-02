import { dialog } from 'electron'
import { Session } from 'main/types'


export default class SystemController {
  constructor(session: Session) {
    this.session = session
  }
  async startup() {
    this.session.windows.open('chromedriver')
  }
  async shutdown() {
    this.session.driver.stopProcess()
    this.session.projects.onProjectUnloaded()
  }
  async crash(error: string) {
    await dialog.showMessageBox({
      message: error,
      type: "error"
    })
    this.quit()
  }
  async quit() {
    const confirm = await this.session.projects.checkIfCurrentProjectChanged()
    if (confirm) {
      this.session.app.exit()
    }
  }
  session: Session
}
