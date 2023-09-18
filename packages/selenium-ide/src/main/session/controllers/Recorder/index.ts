import { CommandShape } from '@seleniumhq/side-model'
import { getActiveCommand, getActiveTest, getActiveCommandIndex } from '@seleniumhq/side-api/dist/helpers/getActiveData'
import { LocatorFields, CoreSessionData, RecordNewCommandInput } from '@seleniumhq/side-api'
import { randomInt, randomUUID } from 'crypto'
import { relative } from 'path'
import BaseController from '../Base'
import { BrowserWindow } from 'electron'

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

const getLastActiveWindowHandleId = (session: CoreSessionData): string => {
  const activeTest = getActiveTest(session)
  const activeIndex = getActiveCommandIndex(session)
  console.log(activeTest, activeIndex)
  const commands = activeTest.commands
  for (let i = activeIndex; i >= 0; i--) {
    let item = commands[i]
    if (item.command == 'selectWindow') {
      let target = item.target as string
      return target.substring('handle=${'.length, target.length - 1)
    }
    if (item.command == 'storeWindowHandle') {
      return item.target as string
    }
  }

  return 'root'
}
export default class RecorderController extends BaseController {
  windowIDs: number[] = []

  async recordNewCommand(
    cmd: RecordNewCommandInput
  ): Promise<CommandShape[] | null> {
    const session = await this.session.state.get()
    if (session.state.status !== 'recording') {
      return null
    }
    const commands: CommandShape[] = []
    if (
      getLastActiveWindowHandleId(session) != cmd.winHandleId 
    ) {
      const selectWindowCommand: CommandShape = {
        id: randomUUID(),
        command: 'selectWindow',
        target: 'handle=${'+cmd.winHandleId+'}',
        value: ''
      }
      commands.push(selectWindowCommand)
    }
    const mainCommand: CommandShape = {
      ...cmd,
      id: randomUUID(),
      target: Array.isArray(cmd.target) ? cmd.target[0][0] : cmd.target,
      targets: Array.isArray(cmd.target) ? cmd.target : [[cmd.target, '']],
      value: Array.isArray(cmd.value) ? cmd.value[0][0] : cmd.value,
    }
    const windows = BrowserWindow.getAllWindows();
    const newWindowIDs = windows.map((window) => window.id);
    const opensWindow = this.windowIDs.length < newWindowIDs.length;
    if (opensWindow) {
      mainCommand.opensWindow = true
      mainCommand.windowHandleName = `win${randomInt(1, 9999)}`
    }
    this.windowIDs = windows.map((window) => window.id);

    commands.push(...getFrameTraversalCommands(
      session.state.recorder.activeFrame,
      cmd.frameLocation as string
    ))
    commands.push(mainCommand)
    return commands
  }

  async requestHighlightElement(fieldName: LocatorFields) {
    const activeCommand = getActiveCommand(await this.session.state.get())
    this.session.api.recorder.onHighlightElement.dispatchEvent(
      activeCommand[fieldName] as string
    )
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

  async getWinHandleId(): Promise<string> {
    const session = await this.session.state.get()
    const activeTest = getActiveTest(session)
    const activeIndex = getActiveCommandIndex(session)

    const commands = activeTest.commands
    for (let i = activeIndex; i >= 0; i--) {
      let item = commands[i]
      if (item.opensWindow && item.windowHandleName) {
        return item.windowHandleName
      }

      if (item.command == 'selectWindow') {
        let target = item.target as string
        return target.substring('handle=${'.length, target.length - 1)
      }
    }
    return 'root'
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
    let playbackWindow = await this.session.windows.getLastPlaybackWindow()
    let inited = false
    if (playbackWindow) {
      const playbackURL = playbackWindow.webContents.getURL()
      inited = !(
        playbackURL.startsWith('file://') &&
        playbackURL.endsWith('/playback-window.html')
      )
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
      let url = new URL(currentCommand.target as string, state.project.url)
      playbackWindow.webContents.loadURL(url.toString())
      
    }
    playbackWindow.focus()
    return null
  }
  async stop() {}
}
