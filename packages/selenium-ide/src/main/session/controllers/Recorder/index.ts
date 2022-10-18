import { CommandShape } from '@seleniumhq/side-model'
import { getActiveCommand } from '@seleniumhq/side-api/dist/helpers/getActiveData'
import { LocatorFields } from '@seleniumhq/side-api'
import { randomInt, randomUUID } from 'crypto'
import { relative } from 'path'
import BaseController from '../Base'

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

  const relativePath = relative(startingFrame, endingFrame)
    .replace(/^.*root/, 'root')
    .split('/')
  const relPathString = relativePath[0]
  switch (relPathString) {
    case '..':
      return [makeSelectFrameCMD('relative=parent')]
    case 'root':
      return [makeSelectFrameCMD('relative=top')]
    default: {
      let frameCommands = []
      const frameTargets = relPathString.split('\\')
      for (let frameTarget of frameTargets) {
        if (frameTarget === '..')
          frameCommands.push(makeSelectFrameCMD('relative=parent'))
        else frameCommands.push(makeSelectFrameCMD(`index=${frameTarget}`))
      }
      return frameCommands
    }
  }
}

export interface RecordNewCommandInput {
  command: string
  target: string | [string, string][]
  value: string | [string, string][]
  insertBeforeLastCommand?: boolean
  frameLocation?: string
}

export default class RecorderController extends BaseController {
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
    const newWindowID = `win${randomInt(1, 9999)}`
    this.session.api.recorder.onNewWindow.dispatchEvent(
      newWindowID,
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
    let pathParts = []
    while (activeFrame.parent) {
      const frameIndex = activeFrame.parent.frames.indexOf(activeFrame)
      pathParts.push(frameIndex)
      activeFrame = activeFrame.parent
    }
    pathParts.push(frameLocation)
    frameLocation = pathParts.reverse().join('/')
    return frameLocation
  }

  async start(): Promise<string | null> {
    var playbackWindow = await this.session.windows.getLastPlaybackWindow()
    var inited = false
    if (playbackWindow) {
      const playbackURL = playbackWindow.webContents.getURL()
      inited = !(playbackURL.startsWith('file://') && playbackURL.endsWith('/playback-window.html'))
    } else {
      await this.session.windows.initializePlaybackWindow()
      playbackWindow = await this.session.windows.getLastPlaybackWindow()
      inited = false
    } 
    
    if (!inited) {
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
