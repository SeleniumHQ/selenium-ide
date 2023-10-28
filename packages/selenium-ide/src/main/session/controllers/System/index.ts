import { dialog } from 'electron'
import BaseController from '../Base'
import { isAutomated } from 'main/util'
import { inspect } from 'util'
import { writeFile } from 'fs/promises'

let firstTime = true
export default class SystemController extends BaseController {
  constructor(session: any) {
    super(session)
    this.writeToLog = this.writeToLog.bind(this)
  }
  isDown = true
  shuttingDown = false
  logs = ''

  async dumpSession() {
    const response = await this.session.dialogs.openSave()
    if (response.canceled) return
    const filePath = response.filePath as string
    await writeFile(
      filePath,
      JSON.stringify(
        {
          project: this.session.projects.project,
          state: this.session.state.state,
          logs: this.logs,
        },
        undefined,
        2
      )
    )
  }

  async getLogPath() {
    return this.session.app.getPath('logs')
  }

  async getLogs() {
    return this.logs
  }

  async writeToLog(...args: any[]) {
    this.logs += args.map((arg) => inspect(arg)).join(' ') + '\n'
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
      await this.session.api.system.onLog.addListener(this.writeToLog)
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
      try {
        await this.session.api.system.onLog.removeListener(this.writeToLog)
      } catch (e) {}
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
