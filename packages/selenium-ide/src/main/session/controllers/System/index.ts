import langFileEn, { LanguageMap } from 'browser/I18N/en'
import langFileZh from 'browser/I18N/zh'
import { dialog, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { writeFile } from 'fs/promises'
import { COLOR_CYAN, isAutomated, vdebuglog } from 'main/util'
import { platform } from 'os'
import { inspect } from 'util'
import BaseController from '../Base'
import { flattenNestedObject, getSupportedLanguage } from 'browser/I18N/util'

let firstTime = true
export default class SystemController extends BaseController {
  constructor(session: any) {
    super(session)
    this.writeToLog = this.writeToLog.bind(this)
    this.getLanguageMap(false)
  }
  isDown = true
  isDev = false
  shuttingDown = false
  languageMap: LanguageMap = langFileEn
  logs: string[] = []
  loggers = {
    api: vdebuglog('api', COLOR_CYAN),
  }

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
    this.logs.push(args.map((arg) => inspect(arg)).join(' '))
  }

  async getLanguageMap(frontend = false) {
    const language = getSupportedLanguage(this.session.app.getLocale())
    this.languageMap = language === 'zh' ? langFileZh : langFileEn
    if (frontend) {
      // React intl uses a flat dict so we convert it here
      return flattenNestedObject(this.languageMap)
    }
    return this.languageMap
  }

  async startup() {
    this.isDev =
      process.env.SIDE_DEV === '1' && process.env.NODE_ENV !== 'production'
    if (this.isDown) {
      // If automated, assume we already have a chromedriver process running
      if (!isAutomated) {
        // Just don't do this until we have CSC unfortunately
        // this.checkForUpdates()
        const browser = this.session.store.get('browserInfo')
        let startupError = await this.session.driver.startProcess(
          this.session.store.get('browserInfo')
        )
        if (startupError) {
          const isElectronBrowser = browser.browser === 'electron'
          if (!isElectronBrowser) {
            console.warn(`
              Failed to locate non-electron driver on startup,
              Resetting to electron driver.
            `)
            await this.session.store.set('browserInfo', {
              browser: 'electron',
              useBidi: false,
              version: '',
            })
            startupError = await this.session.driver.startProcess(
              this.session.store.get('browserInfo')
            )
          }
        }
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

  async checkForUpdates() {
    // Don't check for updates on mac
    // This won't work until we have code signing certs
    if (platform() === 'darwin') return

    this.session.windows.open('update-notifier')
    const window = await this.session.windows.get('update-notifier')
    window.on('ready-to-show', () => {
      autoUpdater.on('checking-for-update', () => {
        window.webContents.executeJavaScript(
          'window.setStatus("Checking for update...")'
        )
      })
      autoUpdater.on('update-available', () => {
        window.webContents.executeJavaScript(
          'window.setStatus("Update Available, downloading...")'
        )
      })
      autoUpdater.on('update-not-available', () => {
        window.webContents.executeJavaScript(
          'window.setStatus("No Update Available")'
        )
        setTimeout(() => window.close(), 5000)
      })
      autoUpdater.on('error', (err) => {
        window.webContents.executeJavaScript(
          `window.setStatus("Error in auto-updater. ${err.message}")`
        )
      })
      autoUpdater.on('download-progress', (progressObj) => {
        const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
        window.webContents.executeJavaScript(`window.setStatus("${message}")`)
      })
      autoUpdater.on('update-downloaded', () => {
        window.webContents.executeJavaScript(
          `window.setStatus("Update Downloaded")`
        )
      })
    })
    ipcMain.once('do-restart', () => {
      autoUpdater.quitAndInstall()
    })
    const promise = await autoUpdater.checkForUpdatesAndNotify()
    if (promise === null) {
      window.webContents.executeJavaScript(
        'window.setStatus("No Update Available")'
      )
      setTimeout(() => window.close(), 5000)
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
          } catch (e) {
            console.warn('Failed to stop driver process', e)
          }
          this.isDown = true
        }
        this.shuttingDown = false
      }
      try {
        await this.session.api.system.onLog.removeListener(this.writeToLog)
      } catch (e) {
        console.warn('Failed to remove log listener', e)
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
    return this.isDown
  }

  async quit() {
    this.session.app.quit()
  }
}
