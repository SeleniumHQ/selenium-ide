import { CommandShape } from '@seleniumhq/side-model'
import { getActiveCommand } from 'api/helpers/getActiveData'
import { LocatorFields } from 'api/types'
import { randomInt, randomUUID } from 'crypto'
import { Session } from 'main/types'
import { relative } from 'path'

const makeSelectFrameCMD = (target: string): CommandShape => ({
  command: 'selectFrame',
  id: randomUUID(),
  target,
  value: '',
})

const getFrameTraversalCommands = (
  startingFrame: string,
  endingFrame: string
): CommandShape[] => {
  if (!startingFrame || !endingFrame || startingFrame === endingFrame) {
    return []
  }

  const relativePath = relative(startingFrame, endingFrame).replace(/^.*root/, 'root').split('/')
  return relativePath.map((part: string) => {
    switch (part) {
      case '..':
        return makeSelectFrameCMD('relative=parent')
      case 'root':
        return makeSelectFrameCMD('relative=top')
      default:
        return makeSelectFrameCMD(`index=${part}`)
    }
  })
}

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
  ): Promise<CommandShape[] | null> {
    const session = await this.session.state.get()
    if (session.state.status !== 'recording') {
      return null
    }
    const mainCommand: CommandShape = {
      ...cmd,
      id: randomUUID(),
      target: Array.isArray(cmd.target) ? cmd.target[0][0] : cmd.target,
      targets: Array.isArray(cmd.target) ? cmd.target : [[cmd.target, '']],
      value: Array.isArray(cmd.value) ? cmd.value[0][0] : cmd.value,
    }
    return getFrameTraversalCommands(
      session.state.recorder.activeFrame,
      cmd.frameLocation as string
    ).concat(mainCommand)
  }

  async handleNewWindow(_details: Electron.HandlerDetails) {
    const session = await this.session.state.get()
    if (session.state.status !== 'recording') return
    this.session.api.recorder.onNewWindow.dispatchEvent(
      `win${randomInt(1, 9999)}`,
      randomUUID()
    )
  }

  async requestSelectElement(activate: boolean, fieldName: LocatorFields) {
    this.session.windows.getLastPlaybackWindow().focus()
    this.session.api.recorder.onRequestSelectElement.dispatchEvent(
      activate,
      fieldName
    )
  }

  async getFrameLocation(event: Electron.IpcMainEvent): Promise<string> {
    let frameLocation = 'root'
    let activeFrame = event.senderFrame
    while (activeFrame.parent) {
      const frameIndex = activeFrame.parent.frames.indexOf(activeFrame)
      frameLocation += `/${frameIndex}`
      activeFrame = activeFrame.parent
    }
    return frameLocation
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
