import {
  Playback,
  PlaybackEvents,
  PlaybackEventShapes,
  Variables,
} from '@seleniumhq/side-runtime'
import { WebDriverExecutorHooks } from '@seleniumhq/side-runtime/src/webdriver'
import { hasID } from '@seleniumhq/side-api/dist/helpers/hasID'
import { Session } from 'main/types'
import BaseController from '../Base'

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
  playback: Playback | null = null
  variables: Variables = new Variables()

  onBeforePlay: NonNullable<WebDriverExecutorHooks['onBeforePlay']> = async ({
    driver: executor,
  }) => {
    const { driver } = executor
    const { windows } = this.session
    const playbackWindow = await windows.getPlaybackWindow()

    let success = false
    if (playbackWindow) {
      // Figure out playback window from document.title and url match
      const handles = await driver.getAllWindowHandles()
      for (let i = 0, ii = handles.length; i !== ii; i++) {
        try {
          await driver.switchTo().window(handles[i])
          const title = await driver.getTitle()
          const url = await driver.getCurrentUrl()
          if (
            title === playbackWindow.getTitle() &&
            url === playbackWindow.webContents.getURL()
          ) {
            success = true
            break
          }
        } catch (e) {
          console.warn('Failed to switch to window', e)
        }
      }
    }
    if (!success) {
      await windows.initializePlaybackWindow()
      await this.onBeforePlay({ driver: executor })
    }
  }

  async pause() {
    this.isPlaying = false
    if (this.playback) {
      await this.playback.pause()
    }
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
    if (this.playback) {
      this.isPlaying = true
      this.playback.resume()
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
    if (!this.playback) {
      const playback = new Playback({
        baseUrl: this.session.projects.project.url,
        executor: await this.session.driver.build({}),
        getTestByName: (name: string) => this.session.tests.getByName(name),
        logger: console,
        variables: this.variables,
        options: {
          delay: this.session.projects.project.delay || 0
        }
      })
      const EE = playback['event-emitter']
      EE.addListener(
        PlaybackEvents.PLAYBACK_STATE_CHANGED,
        this.handlePlaybackStateChanged
      )
      EE.addListener(
        PlaybackEvents.COMMAND_STATE_CHANGED,
        this.handleCommandStateChanged
      )
      this.playback = playback
    }
    /**
     * If not ending at end of test, use playTo command
     * or playSingleCommand if just one command specified.
     * Otherwise, use full play command.
     */
    if (playRange[1] !== -1) {
      const test = this.session.tests.getByID(testID)
      if (playRange[0] === playRange[1]) {
        this.playback.playSingleCommand(test.commands[playRange[0]])
      } else {
        this.playback.playTo(test, playRange[1], playRange[0])
      }
    } else {
      this.playback.play(this.session.tests.getByID(testID), {
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
    const tests = suites.find(hasID(activeSuiteID))?.tests ?? []
    this.play(tests[0])
  }

  async playNextTest() {
    const {
      project: { suites },
      state: { activeSuiteID, activeTestID },
    } = await this.session.state.get()
    const tests = suites.find(hasID(activeSuiteID))?.tests ?? []
    const nextTestIndex = tests.indexOf(activeTestID) + 1
    const nextTest = tests[nextTestIndex]
    if (nextTest) {
      this.session.api.state.onMutate.dispatchEvent('state.setActiveTest', {
        params: [nextTest],
      })
      this.play(nextTest)
    } else {
      this.playingSuite = ''
      this.session.api.state.onMutate.dispatchEvent('playback.stop', {
        params: [],
      })
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

  handlePlaybackStateChanged = (
    e: PlaybackEventShapes['PLAYBACK_STATE_CHANGED']
  ) => {
    const testName = this.session.tests.getByID(this.playingTest)?.name
    console.debug(`Playing state changed ${e.state} for test ${testName}`)
    switch (e.state) {
      case 'aborted':
      case 'errored':
      case 'failed':
      case 'finished':
      case 'stopped':
        const playback = this.playback as Playback
        playback.cleanup()
        this.playback = null
        this.variables = new Variables()
        if (this.playingSuite) {
          this.playNextTest()
        }
    }
    this.session.api.playback.onPlayUpdate.dispatchEvent(e)
  }
}
