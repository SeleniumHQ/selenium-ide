import { dialog } from 'electron'
import { isAutomated } from 'main/util'
import { inspect } from 'util'
import { writeFile } from 'fs/promises'
import BaseController from '../Base'

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
      await this.session.windows.open('logger', { frame: false, show: false })
      const loggerWindow = await this.session.windows.get('logger')
      this.session.windows.useWindowState(
        loggerWindow,
        'windowSizeLogger',
        'windowPositionLogger'
      )
      loggerWindow.show()
      // If automated, assume we already have a chromedriver process running
      if (!isAutomated) {
        const startupError = await this.session.driver.startProcess(
          this.session.store.get('browserInfo')
        )
        if (startupError) {
          console.warn(`
            Failed to locate non-electron driver on startup,
            Resetting to electron driver.
          `)
          await this.session.store.set('browserInfo', {
            browser: 'electron',
            useBidi: false,
            version: '',
          })
          const fallbackStartupError = await this.session.driver.startProcess(
            this.session.store.get('browserInfo')
          )
          if (fallbackStartupError) {
            await this.crash(
              `Unable to startup due to chromedriver error: ${fallbackStartupError}`
            )
          }
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
          try {
            await this.session.driver.stopProcess()
          } catch (e) {}
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
    return this.isDown
  }

  async quit() {
    this.session.app.quit()
  }
}
