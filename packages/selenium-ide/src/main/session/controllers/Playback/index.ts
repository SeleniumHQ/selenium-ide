import {
  Playback,
  PlaybackEvents,
  PlaybackEventShapes,
  Variables,
} from '@seleniumhq/side-runtime'
import { WebDriverExecutorHooks } from '@seleniumhq/side-runtime/src/webdriver'
import { hasID } from '@seleniumhq/side-api/dist/helpers/hasID'
import { randomUUID } from 'crypto'
import { session } from 'electron'
import { Session } from 'main/types'
import { cpus } from 'os'
import BaseController from '../Base'

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
  static defaultPlayRange = [0, -1]
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
    const UUID = randomUUID()
    const registerWindow = async (windowID: number) => {
      let success = false
      const handles = await driver.getAllWindowHandles()
      for (let i = 0, ii = handles.length; i !== ii; i++) {
        const handle = handles[i]
        await driver.switchTo().window(handle)
        const title = await driver.getTitle()
        if (title === UUID) {
          await windows.registerPlaybackWindowHandle(handle, windowID)
          success = true
          break
        }
      }
      if (!success) {
        throw new Error('Failed to switch to playback window')
      }
    }

    if (this.session.playback.playingSuite) {
      const window = await windows.openPlaybackWindow({
        show: false,
        title: UUID,
      })
      await registerWindow(window.id)
      await windows.arrangeWindow(
        window,
        'windowSizePlayback',
        'windowPositionPlayback'
      )
      window.show()
      return
    }

    const playbackWindow = await windows.getPlaybackWindow()
    if (playbackWindow) {
      const handle = await windows.getPlaybackWindowHandleByID(
        playbackWindow.id
      )
      if (handle) {
        await driver.switchTo().window(handle)
        return
      }
    }

    const window = await windows.openPlaybackWindow({ title: UUID })
    await registerWindow(window.id)
  }

  async pause() {
    this.isPlaying = false
    this.playbacks.forEach((playback) => playback.pause())
  }

  async stop() {
    if (this.isPlaying) {
      await this.pause()
    }
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

  async play(testID: string, playRange = PlaybackController.defaultPlayRange) {
    this.playingTest = testID
    this.playRange = playRange
    this.isPlaying = true
    /**
     * Create playback if none exists
     */
    // const browser = 'electron'
    const playback = new Playback({
      baseUrl: this.session.projects.project.url,
      executor: await this.session.driver.build({}),
      getTestByName: (name: string) => this.session.tests.getByName(name),
      logger: console,
      variables: new Variables(),
      options: {
        delay: this.session.projects.project.delay || 0,
      },
    })
    console.log('playback init')
    await playback.init()
    console.log('playback cookies deleted')

    const EE = playback['event-emitter']
    EE.addListener(
      PlaybackEvents.PLAYBACK_STATE_CHANGED,
      this.handlePlaybackStateChanged(playback, testID)
    )
    EE.addListener(
      PlaybackEvents.COMMAND_STATE_CHANGED,
      this.handleCommandStateChanged
    )
    this.playbacks.push(playback)
    /**
     * If not ending at end of test, use playTo command
     * or playSingleCommand if just one command specified.
     * Otherwise, use full play command.
     */
    if (playRange[1] !== -1) {
      const test = this.session.tests.getByID(testID)
      if (playRange[0] === playRange[1]) {
        playback.playSingleCommand(test.commands[playRange[0]])
      } else {
        playback.playTo(test, playRange[1], playRange[0])
      }
    } else {
      playback.play(this.session.tests.getByID(testID), {
        startingCommandIndex: playRange[0],
      })
    }
  }

  async playSuite() {
    const {
      project: { suites },
      state: { activeSuiteID },
    } = await this.session.state.get()
    this.playingSuite = activeSuiteID
    const suite = suites.find(hasID(activeSuiteID))
    this.testQueue = suite?.tests ?? []
    if (suite?.parallel) {
      for (let i = 0; i < parallelExecutions; i++) {
        this.playNextTest()
      }
    } else {
      this.playNextTest()
    }
  }

  async playNextTest() {
    const nextTest = this.testQueue.shift()
    if (nextTest) {
      const {
        project: { suites },
        state: { activeSuiteID },
      } = await this.session.state.get()
      const suite = suites.find(hasID(activeSuiteID))
      const persistSession = suite?.persistSession ?? false
      if (!persistSession) {
        await session.defaultSession.clearStorageData({
          storages: ['cookies', 'localstorage'],
        })
      }
      await this.play(nextTest)
    }
  }

  handleCommandStateChanged = async (
    e: PlaybackEventShapes['COMMAND_STATE_CHANGED']
  ) => {
    this.session.api.playback.onStepUpdate.dispatchEvent(e)
    const cmd = e.command
    const niceString = [cmd.command, cmd.target, cmd.value]
      .filter((v) => !!v)
      .join('|')
    console.debug(`${e.state} ${niceString}`)
  }

  handlePlaybackStateChanged =
    (playback: Playback, testID: string) =>
    async (e: PlaybackEventShapes['PLAYBACK_STATE_CHANGED']) => {
      const testName = this.session.tests.getByID(testID)?.name
      console.debug(
        `Playing state changed ${e.state} for test ${testName}`,
        this.playingSuite
      )
      switch (e.state) {
        case 'aborted':
        case 'errored':
        case 'failed':
        case 'finished':
        case 'stopped':
          if (this.playingSuite) {
            try {
              await playback.executor.driver.close()
            } catch (e) {}
            this.playbacks.splice(this.playbacks.indexOf(playback), 1)
            await playback.cleanup()
            if (!this.testQueue.length && !this.playbacks.length) {
              this.playingSuite = ''
              this.session.api.state.onMutate.dispatchEvent('playback.stop', {
                params: [],
              })
            } else {
              this.playNextTest()
            }
          }
      }
      this.session.api.playback.onPlayUpdate.dispatchEvent(e)
    }
}
