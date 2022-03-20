import { CommandShape } from '@seleniumhq/side-model'
import { getActiveCommand } from 'api/helpers/getActiveData'
import { LocatorFields } from 'api/types'
import { randomInt, randomUUID } from 'crypto'
import { Session } from 'main/types'

export interface RecordNewCommandInput {
  command: string
  target: string | [string, string][]
  value: string | [string, string][]
  insertBeforeLastCommand?: boolean
  frameLocation?: string
}
export default class RecorderController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async recordNewCommand(
    cmd: RecordNewCommandInput
  ): Promise<CommandShape | null> {
    const session = await this.session.state.get()
    if (session.state.status !== 'recording') {
      return null
    }
    return {
      ...cmd,
      id: randomUUID(),
      target: Array.isArray(cmd.target) ? cmd.target[0][0] : cmd.target,
      targets: Array.isArray(cmd.target) ? cmd.target : [[cmd.target, '']],
      value: Array.isArray(cmd.value) ? cmd.value[0][0] : cmd.value,
    }
  }

  async handleNewWindow(_details: Electron.HandlerDetails) {
    const session = await this.session.state.get()
    if (session.state.status !== 'recording') return
    this.session.api.recorder.onNewWindow.dispatchEvent(
      `win${randomInt(1, 9999)}`,
      randomUUID()
    )
  }

  async requestAttach(): Promise<boolean> {
    console.log('Request attach thingy?')
    return true
  }
  async requestSelectElement(activate: boolean, fieldName: LocatorFields) {
    this.session.windows.getLastPlaybackWindow().focus()
    this.session.api.recorder.onRequestSelectElement.dispatchEvent(activate, fieldName)
  } 
  async setActiveContext(sessionID: string, frameLocation: string) {
    console.log('Setting active context', sessionID, frameLocation)
  }
  async setFrameLocation(frameLocation: string) {
    console.log('Setting frame location', frameLocation)
  }
  async setWindowHandle(sessionID: string, handle: string) {
    console.log('Setting window handle', sessionID, handle)
  }
  async start(): Promise<string | null> {
    const playbackWindow = await this.session.windows.get('playback-window')
    const playbackURL = playbackWindow.webContents.getURL()
    if (
      playbackURL.startsWith('file://') &&
      playbackURL.endsWith('/playback-window.html')
    ) {
      // Needs to open a URL, if on an open command, just use that
      // Otherwise add an open command to the record commands
      const state = await this.session.state.get()
      const currentCommand = getActiveCommand(state)
      if (currentCommand.command !== 'open') {
        playbackWindow.webContents.loadURL(`${state.project.url}/`)
        return randomUUID()
      }
      playbackWindow.webContents.loadURL(
        `${state.project.url}${currentCommand.target}`
      )
    }
    playbackWindow.focus()
    return null
  }
  async stop() {}
}
