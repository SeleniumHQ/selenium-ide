import {
  CommandShape,
  getActiveCommand,
  getActiveTest,
  hasID,
} from '@seleniumhq/side-api'
import {
  Playback,
  PlaybackEvents,
  PlaybackEventShapes,
  RunningPromise,
  Variables,
} from '@seleniumhq/side-runtime'
import { WebDriverExecutorHooks } from '@seleniumhq/side-runtime/dist/webdriver'
import { randomUUID } from 'crypto'
import { Session } from 'main/types'
import { cpus } from 'os'
import BaseController from '../Base'
import { retry } from '@seleniumhq/side-commons'

const parallelExecutions = Math.floor(cpus().length / 2)

/**
 * This is a wrapper on the Playback construct of the side-runtime. Once again,
 * I am ashamed. When hoisted, the underlying playback thing is accessed at
 * this.session.playback.playback. In a better world, this would be something
 * like this.session.playback.runtime, but I am not up to task today. :(
 */
export default class PlaybackController extends BaseController {
  constructor(session: Session) {
    super(session)
    this.handleCommandStateChanged = this.handleCommandStateChanged.bind(this)
    this.handlePlaybackStateChanged = this.handlePlaybackStateChanged.bind(this)
  }
  static defaultPlayRange: [number, number] = [0, -1]
  currentStepIndex: null | number = null
  isPlaying = false
  playRange = [0, -1]
  playingSuite = ''
  playingTest = ''
  playbacks: Playback[] = []
  testQueue: string[] = []
  variables: Variables = new Variables()

  onBeforePlay: NonNullable<WebDriverExecutorHooks['onBeforePlay']> = async ({
    driver: executor,
  }) => {
    const { driver } = executor
    const { windows } = this.session
    const capabilities = await driver.getCapabilities()
    const useBidi = capabilities.get('webSocketUrl')

    if (useBidi) {
      const handles = await driver.getAllWindowHandles()
      if (!handles.length) {
        const playbackPos = await this.session.store.get(
          'windowPositionPlayback'
        )
        const playbackSize = await this.session.store.get('windowSizePlayback')
        await driver.switchTo().newWindow('tab')
        await driver
          .manage()
          .window()
          .setPosition(...playbackPos)
        await driver
          .manage()
          .window()
          .setSize(...playbackSize)
        const windowDimensionCache = setInterval(async () => {
          const handles = await driver.getAllWindowHandles()
          if (!handles.length) {
            clearInterval(windowDimensionCache)
          }
          const pos = await driver.manage().window().getPosition()
          const size = await driver.manage().window().getSize()
          await this.session.store.set('windowPositionPlayback', [pos.x, pos.y])
          await this.session.store.set('windowSizePlayback', [
            size.width,
            size.height,
          ])
        }, 1000)
      }
      return
    }

    if (!this.session.playback.playingSuite) {
      const playbackWindow = await windows.getActivePlaybackWindow()
      if (playbackWindow) {
        const handle = await windows.getPlaybackWindowHandleByID(
          playbackWindow.id
        )
        if (handle) {
          await driver.switchTo().window(handle)
          return
        }
      }
    }
  }

  async pause() {
    this.isPlaying = false
    this.playbacks.forEach((playback) => playback.pause())
  }

  async performCommand(command: Omit<CommandShape, 'id'>) {
    const playback = await this.getPlayback(
      this.session.state.state.activeTestID
    )
    await playback.playSingleCommand({ ...command, id: '-1' })
  }

  async stop() {
    if (this.isPlaying) {
      await this.pause()
    }
    this.playbacks.forEach((playback) => playback.stop())
    this.currentStepIndex = 0
    this.playRange = PlaybackController.defaultPlayRange
    this.playingSuite = ''
    this.playingTest = ''
  }

  async resume() {
    if (this.playbacks.length) {
      this.isPlaying = true
      this.playbacks.forEach((playback) => playback.resume())
    } else {
      const sessionState = await this.session.state.get()
      await this.play(sessionState.state.activeTestID)
    }
  }

  async getPlayback(testID?: string, forceNewPlayback = false) {
    const browserInfo = this.session.store.get('browserInfo')
    const makeNewPlayback = !this.playbacks.length || forceNewPlayback
    let playback: Playback
    if (makeNewPlayback) {
      playback = new Playback({
        baseUrl: this.session.projects.project.url,
        executor: await this.session.driver.build({
          browser: browserInfo.browser,
        }),
        getTestByName: (name: string) => this.session.tests.getByName(name),
        logger: console,
        variables: new Variables(),
        options: {
          delay: this.session.projects.project.delay || 0,
        },
      })
      await playback.init()
      this.playbacks.push(playback)
      if (browserInfo.useBidi) {
        await playback.executor.driver.switchTo().newWindow('window')
      } else {
        if (testID) {
          playback.state.testID = testID
        }
        await this.claimPlaybackWindow(playback, forceNewPlayback)
      }
    } else {
      playback = this.playbacks[0]
      if (testID) {
        playback.state.testID = testID
      }
      try {
        await this.claimPlaybackWindow(playback)
      } catch (e) {
        // playback has become invalid
        this.playbacks.splice(this.playbacks.indexOf(playback), 1)
        await playback.cleanup()
        playback = await this.getPlayback(testID)
      }
    }
    return playback
  }

  async claimPlaybackWindow(playback: Playback, forceNewWindow = false) {
    const executor = playback.executor
    const driver = executor.driver

    let window: Electron.BrowserWindow | null
    // Confirm webdriver connection
    driver.executeScript('true')
    try {
      if (forceNewWindow) {
        throw new Error('Force new window')
      }
      window = await this.session.windows.requestWindowForPlayback(playback)!
      if (!window) {
        throw new Error('No windows found')
      }
    } catch (windowDoesNotExist) {
      const UUID = randomUUID()
      window = await this.session.windows.openPlaybackWindow(playback, {
        title: UUID,
      })
      const handle = await this.session.windows.getPlaybackWindowHandleByID(
        window.id
      )!
      const state = await this.session.state.get()
      const currentTest = getActiveTest(state)
      const currentCommand = getActiveCommand(state)
      const firstURL = new URL(
        currentTest.commands.find((cmd) => cmd.command === 'open')?.target ??
          '/',
        state.project.url
      )
      const url =
        currentCommand.command === 'open'
          ? new URL(currentCommand.target as string, state.project.url).href
          : firstURL.href
      try {
        await driver.switchTo().window(handle)
        await retry(() => window!.loadURL(url), 3, 500)
      } catch (e) {
        console.warn('Open command failed:', e)
      }
    }
    return window!
  }

  async play(
    testID: string,
    playRange = PlaybackController.defaultPlayRange,
    forceNewPlayback = false
  ) {
    this.playingTest = testID
    this.playRange = playRange
    this.isPlaying = true
    const playback = await this.getPlayback(testID, forceNewPlayback)
    const EE = playback['event-emitter']
    const handlePlaybackStateChanged = this.handlePlaybackStateChanged(
      playback,
      testID
    )
    EE.addListener(
      PlaybackEvents.PLAYBACK_STATE_CHANGED,
      handlePlaybackStateChanged
    )
    EE.addListener(
      PlaybackEvents.COMMAND_STATE_CHANGED,
      this.handleCommandStateChanged
    )
    /**
     * If not ending at end of test, use playTo command
     * or playSingleCommand if just one command specified.
     * Otherwise, use full play command.
     */
    let promise: () => RunningPromise | undefined
    if (playRange[1] !== -1) {
      const test = this.session.tests.getByID(testID)
      promise = await playback.playTo(test, playRange[1], playRange[0])
    } else {
      promise = await playback.play(this.session.tests.getByID(testID), {
        startingCommandIndex: playRange[0],
      })
    }
    const handleTestResolution = async () => {
      try {
        await promise()
      } catch (e) {
        console.error(e)
      } finally {
        EE.removeListener(
          PlaybackEvents.PLAYBACK_STATE_CHANGED,
          handlePlaybackStateChanged
        )
        EE.removeListener(
          PlaybackEvents.COMMAND_STATE_CHANGED,
          this.handleCommandStateChanged
        )
      }
    }
    handleTestResolution()
  }

  async isParallel() {
    const {
      project: { suites },
      state: { activeSuiteID },
    } = await this.session.state.get()
    if (!this.playingSuite) {
      return false
    }
    const suite = suites.find(hasID(activeSuiteID))
    return suite?.parallel ?? false
  }

  async playSuite() {
    const {
      project: { suites },
      state: { activeSuiteID },
    } = await this.session.state.get()
    this.playingSuite = activeSuiteID
    const suite = suites.find(hasID(activeSuiteID))
    this.testQueue = suite?.tests.slice() ?? []
    if (suite?.parallel) {
      for (let i = 0; i < parallelExecutions; i++) {
        this.playNextTest(true)
        await new Promise((res) => setTimeout(res))
      }
    } else {
      this.playNextTest(true)
    }
  }

  async playNextTest(forceNewPlayback: boolean = false) {
    const nextTest = this.testQueue.shift()
    if (nextTest) {
      console.log(
        'Playing test?',
        nextTest,
        this.session.projects.project.tests.find(hasID(nextTest))?.name
      )
      await this.session.api.playback.play(
        nextTest,
        PlaybackController.defaultPlayRange,
        forceNewPlayback
      )
    }
  }

  handleCommandStateChanged = async (
    e: PlaybackEventShapes['COMMAND_STATE_CHANGED']
  ) => {
    if (e.id !== '-1') {
      this.session.api.playback.onStepUpdate.dispatchEvent(e)
    }
    /*
    const cmd = e.command
    const niceString = [cmd.command, cmd.target, cmd.value]
      .filter((v) => !!v)
      .join('|')
    console.debug(`${e.state} ${niceString}`)
    if (e.error) {
      console.error(e.error)
    }
    */
  }

  handlePlaybackStateChanged =
    (playback: Playback, testID?: string) =>
    async (e: PlaybackEventShapes['PLAYBACK_STATE_CHANGED']) => {
      const testName = this.session.tests.getByID(
        testID || this.session.state.state.activeTestID
      )?.name
      console.debug(`Playing state changed ${e.state} for test ${testName}`)
      let closeAll = false
      switch (e.state) {
        case 'aborted':
        case 'errored':
        case 'failed':
        case 'finished':
        case 'stopped':
          if (this.playingSuite) {
            closeAll = e.state === 'finished'
            if (this.testQueue.length) {
              setTimeout(() => this.playNextTest(true))
            }
          }
          this.playbacks.splice(this.playbacks.indexOf(playback), 1)
          this.session.windows.releasePlaybackWindows(playback, closeAll)
          await playback.cleanup()
      }
      const fullyComplete =
        this.playbacks.length === 0 || this.testQueue.length === 0
      if (fullyComplete) {
        this.playingSuite = ''
      }
      this.session.api.playback.onPlayUpdate.dispatchEvent({
        state: e.state,
        testID,
        intermediate: !fullyComplete,
      })
    }
}
