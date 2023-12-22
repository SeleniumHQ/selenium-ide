import { CommandShape } from '@seleniumhq/side-model'
import {
  getActiveCommand,
  getActiveCommandIndex,
  getActiveWindowHandleID,
} from '@seleniumhq/side-api/dist/helpers/getActiveData'
import {
  LocatorFields,
  RecordNewCommandInput,
} from '@seleniumhq/side-api'
import { randomInt, randomUUID } from 'crypto'
import { relative } from 'node:path'
import BaseController from '../Base'
import { BrowserWindow } from 'electron'
import { WebDriverExecutor } from '@seleniumhq/side-runtime'

const uninitializedWindows = ['data:,', 'about:blank']

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

export default class RecorderController extends BaseController {
  driver!: WebDriverExecutor
  windowIDs: number[] = []

  async recordNewCommand(
    cmd: RecordNewCommandInput
  ): Promise<CommandShape[] | null> {
    const session = await this.session.state.get()
    if (session.state.status !== 'recording') {
      return null
    }
    const activeWindowHandleID = getActiveWindowHandleID(session) || 'root'
    const commands = []
    if (activeWindowHandleID != cmd.winHandleId) {
      const selectWindowCommand: CommandShape = {
        id: randomUUID(),
        command: 'selectWindow',
        target: 'handle=${' + cmd.winHandleId + '}',
        value: '',
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
    const windows = BrowserWindow.getAllWindows()
    this.windowIDs = windows.map((window) => window.id)

    commands.push(
      ...getFrameTraversalCommands(
        session.state.recorder.activeFrame,
        cmd.frameLocation as string
      )
    )
    commands.push(mainCommand)
    return commands
  }

  async requestHighlightElement(fieldName: LocatorFields) {
    const activeCommand = getActiveCommand(await this.session.state.get())
    this.session.api.recorder.onHighlightElement.dispatchEvent(
      activeCommand[fieldName] as string
    )
  }

  async handleNewWindow() {
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

  async requestElementAt(x: number, y: number) {
    const results =
      await this.session.api.recorder.onRequestElementAt.dispatchEventAsync(
        x,
        y
      )
    const allResults = results.flat().flat().filter(Boolean)
    if (allResults.length) {
      return allResults[0]
    }
  }

  async getWinHandleId(): Promise<string> {
    const session = await this.session.state.get()
    return getActiveWindowHandleID(session) || 'root'
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

  /**
   * Returns a string correlating to the window handle of the window that was opened.
   * If the window was opened by a command, the handle will be the name of the window.
   */
  async start(): Promise<{
    newStepID: string
    windowHandle: string | null
  } | null> {
    const useBidi = this.session.store.get('browserInfo.useBidi')
    const newStepID = randomUUID()
    this.driver = await this.session.driver.build()
    if (useBidi) {
      const firstWindowURL = await this.driver.driver.getCurrentUrl()
      if (uninitializedWindows.includes(firstWindowURL)) {
        await this.driver.doOpen(this.session.projects.project.url)
      }
      const windowHandle = await this.driver.driver.getWindowHandle()
      return { newStepID, windowHandle }
    }

    let playbackWindow = await this.session.windows.getLastPlaybackWindow()
    if (playbackWindow) {
      playbackWindow.focus()
      const windowHandle =
        (await this.session.windows.getPlaybackWindowHandleByID(
          playbackWindow.id
        )) as string
      return { newStepID, windowHandle }
    }

    const state = await this.session.state.get()
    console.log('hello!!')
    const activeCommand = getActiveCommand(state)
    const activeCommandIndex = getActiveCommandIndex(state)
    if (activeCommandIndex > 0) {
      await this.session.playback.play(state.state.activeTestID, [
        0,
        activeCommandIndex,
      ])
      await this.session.playback.stop()
      await this.session.api.state.setActiveCommand(activeCommand.id)
      const windowHandle = await this.getWinHandleId()
      return { newStepID, windowHandle }
    }
    // Needs to open a URL, if on an open command, just use that
    // Otherwise add an open command to the record commands
    playbackWindow = await this.session.windows.openPlaybackWindow()
    const currentCommand = getActiveCommand(state)
    if (currentCommand.command !== 'open') {
      playbackWindow.webContents.loadURL(`${state.project.url}/`)
      return { newStepID, windowHandle: 'root' }
    }
    let url = new URL(currentCommand.target as string, state.project.url)
    playbackWindow.webContents.loadURL(url.toString())
    const windowHandle = currentCommand.windowHandleName! || 'root'
    return { newStepID, windowHandle }
  }
  async stop() {}
}
