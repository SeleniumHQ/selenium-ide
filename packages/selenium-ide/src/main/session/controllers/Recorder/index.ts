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
import { randomUUID } from 'crypto'
import { relative } from 'node:path'
import BaseController from '../Base'
import { BrowserWindow } from 'electron'

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
  windowIDs: number[] = []

  async recordNewCommand(
    cmd: RecordNewCommandInput,
    overrideRecorder = false
  ): Promise<CommandShape[] | null> {
    const session = await this.session.state.get()
    if (session.state.status !== 'recording' && !overrideRecorder) {
      return null
    }
    const activeWindowHandleID = getActiveWindowHandleID(session) || 'root'
    const commands = []
    if (cmd.winHandleId && activeWindowHandleID != cmd.winHandleId) {
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

  async requestSelectElement(activate: boolean, fieldName: LocatorFields) {
    this.session.windows.getActivePlaybackWindow()?.focus()
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
    return allResults
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
  async start(): Promise<string> {
    const playback = await this.session.playback.getPlayback(this.session.state.state.activeTestID)
    const executor = playback.executor
    const driver = executor.driver
    const useBidi = this.session.store.get('browserInfo.useBidi')
    const newStepID = randomUUID()
    if (useBidi) {
      const firstWindowURL = await driver.getCurrentUrl()
      if (uninitializedWindows.includes(firstWindowURL)) {
        await executor.doOpen(this.session.projects.project.url)
      }
      return newStepID
    }

    let playbackWindow = await this.session.windows.getActivePlaybackWindow()
    if (playbackWindow) {
      playbackWindow.focus()
      return newStepID
    }

    const state = await this.session.state.get()
    const activeCommand = getActiveCommand(state)
    const activeCommandIndex = getActiveCommandIndex(state)
    if (activeCommandIndex > 0) {
      await this.session.playback.play(state.state.activeTestID, [
        0,
        activeCommandIndex,
      ])
      await this.session.playback.stop()
      await this.session.api.state.setActiveCommand(activeCommand.id)
      return newStepID
    }
    // Needs to open a URL, if on an open command, just use that
    // Otherwise add an open command to the record commands
    const currentCommand = getActiveCommand(state)
    if (currentCommand.command !== 'open') {
      playback.executor.doOpen(state.project.url)
      return newStepID
    }
    const url = new URL(currentCommand.target as string, state.project.url)
    playback.executor.doOpen(url.toString())
    return newStepID
  }
  async stop() {}
}
