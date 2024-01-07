import { BrowserWindow, ipcMain } from 'electron'
import BaseController from '../Base'
import { vdebuglog } from 'main/util'
import { hyphenToCamelCase } from '@seleniumhq/side-commons/dist/string'

const PolyfillLog = vdebuglog('polyfill-implementation', 'orange')

type PolyfillKeys = 'alert' | 'confirm' | 'prompt'

type PolyfillBase<T> = {
  ready: boolean
  reject: ((reason: string | Error) => void) | null
  resolve: ((arg: T) => void) | null
  window: Electron.BrowserWindow | null
}

type PolyfillAlert = PolyfillBase<void> & {
  alert: string | null
}

type PolyfillConfirm = PolyfillBase<boolean> & {
  confirm: string | null
}

type PolyfillPrompt = PolyfillBase<string | null> & {
  question: string | null
}
/**
 * This provides a rudimentary prompt for electron support
 */

const polyfillKeys: PolyfillKeys[] = ['alert', 'confirm', 'prompt']
export default class PromptController extends BaseController {
  initialized = false
  alert: PolyfillAlert = {
    alert: null,
    ready: false,
    reject: null,
    resolve: null,
    window: null,
  }
  confirm: PolyfillConfirm = {
    confirm: null,
    ready: false,
    reject: null,
    resolve: null,
    window: null,
  }
  prompt: PolyfillPrompt = {
    question: null,
    ready: false,
    reject: null,
    resolve: null,
    window: null,
  }

  async onProjectLoaded(): Promise<void> {
    if (!this.initialized) {
      polyfillKeys.forEach((key) => {
        ipcMain.on(key + '-polyfill', (event, alert) => {
          PolyfillLog(key + '-polyfill', alert)
          // @ts-expect-error - Dynamic key woes
          return this[key + 'Polyfill'](event, alert)
        })
      })
      this.initialized = true
    }
  }
  async onProjectUnloaded(): Promise<void> {
    if (this.initialized) {
      polyfillKeys.forEach((key) => {
        ipcMain.removeAllListeners(key + '-polyfill')
      })
      this.initialized = false
    }
  }

  async alertPolyfill(event: Electron.IpcMainEvent, alert: string) {
    this.alert.alert = alert
    const successKeys = ['accept-alert']
    const errorKey = 'alert-error'
    this.wireUpEventPromise(this.alert, event, successKeys, errorKey)
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    await this.displayDialog(
      'alert',
      this.alert,
      parentWindow!,
      `
        document.querySelector('#alert').innerText = "${alert}";
      `
    )
    await this.waitForResolution(this.alert, successKeys, errorKey)
    this.alert.alert = null
  }

  async confirmPolyfill(event: Electron.IpcMainEvent, confirm: string) {
    this.confirm.confirm = confirm
    const successKeys = ['accept-confirmation', 'dismiss-confirmation']
    const errorKey = 'confirmation-error'
    this.wireUpEventPromise(this.confirm, event, successKeys, errorKey)
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    await this.displayDialog(
      'confirm',
      this.confirm,
      parentWindow!,
      `
        document.querySelector('#confirm').innerText = "${confirm}";
      `
    )
    await this.waitForResolution(
      this.confirm,
      successKeys,
      errorKey
    )
    this.confirm.confirm = null
  }

  async promptPolyfill(
    event: Electron.IpcMainEvent,
    question: string,
    defaultValue = ''
  ) {
    this.prompt.question = question
    const successKeys = ['answer-prompt', 'dismiss-prompt']
    const errorKey = 'prompt-error'
    this.wireUpEventPromise(this.prompt, event, successKeys, errorKey)
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    await this.displayDialog(
      'prompt',
      this.prompt,
      parentWindow!,
      `
        document.querySelector('#question').innerText = "${question}";
        document.querySelector('#answer').value = "${defaultValue}";
      `
    )
    await this.waitForResolution(this.prompt, successKeys, errorKey)
    this.prompt.question = null
  }

  async wireUpEventPromise(
    obj: PolyfillBase<any>,
    event: Electron.IpcMainEvent,
    successKeys: string[],
    errorKey: string
  ) {
    try {
      const result = await new Promise<string | null>((resolve, reject) => {
        obj.resolve = resolve
        obj.reject = reject
      })
      event.returnValue = result
    } catch (e) {
      event.returnValue = null
    } finally {
      successKeys.forEach((key) => {
        ipcMain.removeAllListeners(key)
      })
      ipcMain.removeAllListeners(errorKey)
      if (obj.window) {
        obj.window.close()
        obj.window = null
      }
      obj.ready = false
      obj.resolve = null
      obj.reject = null
    }
  }

  async displayDialog(
    key: PolyfillKeys,
    obj: PolyfillBase<any>,
    parentWindow: Electron.BrowserWindow,
    initScript: string
  ) {
    // Initializing the prompt
    this.session.windows.open(key, {
      parent: parentWindow,
    })
    obj.window = await this.session.windows.get(key)!
    obj.window.once('ready-to-show', () => {
      const promptWindow = obj.window!
      promptWindow.webContents.executeJavaScript(initScript)
      promptWindow.show()
      obj.ready = true
    })
  }

  async waitForResolution<T>(
    obj: PolyfillBase<any>,
    successKeys: string[],
    errorKey: string
  ) {
    // Waiting for complete message
    let result: T | null = null
    try {
      result = await this._waitForResolution(obj.window!, successKeys, errorKey)
      obj.resolve?.(result)
    } catch (e) {
      console.error(e)
      obj.reject?.(e as Error)
    }
  }

  async _waitForResolution<T>(
    window: BrowserWindow,
    successKeys: string[],
    errorKey: string
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      successKeys.forEach((key) => {
        ipcMain.on(key, (_event, value) => {
          PolyfillLog(key, value, this.session.state.state.status)
          if (this.session.state.state.status === 'recording') {
            this.session.api.recorder.recordNewCommand({
              command: hyphenToCamelCase(key),
              target: value,
              value: '',
            })
          }
          resolve(value)
        })
      })

      ipcMain.on(errorKey, (_event, message) => {
        reject(new Error(message))
      })

      window.on('unresponsive', () => {
        reject(new Error('Window was unresponsive'))
      })

      window.on('closed', () => {
        resolve(null)
      })
    })
  }

  hasBlockingDialog() {
    return (
      this.alert.ready || this.confirm.ready || this.prompt.ready || false
    )
  }
}
