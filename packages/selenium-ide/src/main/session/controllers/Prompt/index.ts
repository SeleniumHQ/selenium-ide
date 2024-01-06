import { BrowserWindow, ipcMain } from 'electron'
import BaseController from '../Base'

/**
 * This provides a rudimentary prompt for electron support
 */
export default class PromptController extends BaseController {
  initialized = false
  promptQuestion: string | null = null
  promptWindow: Electron.BrowserWindow | null = null
  promptReject: ((reason: string | Error) => void) | null = null
  promptResolve: ((str: string | null) => void) | null = null

  async onProjectLoaded(): Promise<void> {
    if (!this.initialized) {
      ipcMain.on('prompt-polyfill', (event, question, defaultValue) =>
        this.promptPolyfill(event, question, defaultValue)
      )
      this.initialized = true
    }
  }

  cleanup() {
    this.promptQuestion = null
    this.promptResolve = null
    this.promptReject = null
    ipcMain.removeAllListeners('prompt-cancel')
    ipcMain.removeAllListeners('prompt-submit')
    ipcMain.removeAllListeners('prompt-error')
    if (this.promptWindow) {
      this.promptWindow.close()
      this.promptWindow = null
    }
  }

  promptPolyfill(
    event: Electron.IpcMainEvent,
    question: string,
    defaultValue?: string
  ) {
    this.promptQuestion = question
    this.wireUpEventPromise(event)
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    this.displayPrompt(parentWindow!, question, defaultValue)
  }

  async wireUpEventPromise(event: Electron.IpcMainEvent) {
    try {
      const result = await new Promise<string | null>((resolve, reject) => {
        this.promptResolve = resolve
        this.promptReject = reject
      })
      event.returnValue = result
    } catch (e) {
      event.returnValue = null
    } finally {
      this.cleanup()
    }
  }

  async displayPrompt(
    parentWindow: Electron.BrowserWindow,
    question: string,
    defaultValue = ''
  ) {
    // Initializing the prompt
    this.session.windows.open('prompt', {
      parent: parentWindow,
    })
    this.promptWindow = await this.session.windows.get('prompt')!
    this.promptWindow.once('ready-to-show', () => {
      const promptWindow = this.promptWindow!
      promptWindow.webContents.executeJavaScript(`
        document.querySelector('#question').innerText = "${question}";
        document.querySelector('#answer').value = "${defaultValue}";
      `)
      promptWindow!.show()
    })

    // Waiting for complete message
    let result: string | null = null
    try {
      result = await this.waitForPromptResolution(this.promptWindow)
      this.promptResolve?.(result)
    } catch (e) {
      console.error(e)
      this.promptReject?.(e as Error)
    }
  }

  async waitForPromptResolution(
    promptWindow: BrowserWindow
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      ipcMain.on('prompt-submit', (_event, value: string) => {
        console.log('prompt-submit', value, this.session.state.state.status)
        if (this.session.state.state.status === 'recording') {
          this.session.api.recorder.recordNewCommand({
            command: 'answerPrompt',
            target: value,
            value: '',
          })
        }
        resolve(value)
      })

      ipcMain.on('prompt-cancel', () => {
        console.log('prompt-dismiss', this.session.state.state.status)
        if (this.session.state.state.status === 'recording') {
          this.session.api.recorder.recordNewCommand({
            command: 'dismissPrompt',
            target: '',
            value: '',
          })
        }
        resolve(null)
      })

      ipcMain.on('prompt-error', (_event, message) => {
        reject(new Error(message))
      })

      promptWindow.on('unresponsive', () => {
        reject(new Error('Window was unresponsive'))
      })

      promptWindow.on('closed', () => {
        resolve(null)
      })
    })
  }
}
