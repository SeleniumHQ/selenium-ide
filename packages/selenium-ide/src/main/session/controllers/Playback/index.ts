import {
  Playback,
  PlaybackEvents,
  PlaybackEventShapes,
  Variables,
} from '@seleniumhq/side-runtime'
import { WebDriverExecutorHooks } from '@seleniumhq/side-runtime/src/webdriver'
import { hasID } from 'api/helpers/hasID'
import { Session } from 'main/types'

export default class PlaybackController {
  constructor(session: Session) {
    this.session = session
    this.handleCommandStateChanged = this.handleCommandStateChanged.bind(this)
    this.playback = null
  }
  static defaultPlayRange = [0, -1]
  currentStepIndex: null | number = null
  isPlaying = false
  playRange = [0, -1]
  playingSuite = ''
  playingTest = ''
  playback: Playback | null
  session: Session

  onBeforePlay: NonNullable<WebDriverExecutorHooks['onBeforePlay']> = async ({
    driver: executor,
  }) => {
    const { driver } = executor
    const { windows } = this.session
    if (this.playRange[0] === 0) {
      await windows.initializePlaybackWindow()
    }
    const playbackWindow = await windows.getPlaybackWindow()

    // Figure out playback window from document.title
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
          break
        }
      } catch (e) {
        console.warn('Failed to switch to window', e)
      }
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
    if (!this.playback) {
      const playback = new Playback({
        baseUrl: this.session.projects.project.url,
        executor: await this.session.driver.build({}),
        getTestByName: (name: string) => this.session.tests.getByName(name),
        logger: console,
        variables: new Variables(),
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
    this.playback.play(this.session.tests.getByID(testID), {
      startingCommandIndex: playRange[0],
    })
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

  handleCommandStateChanged = (
    e: PlaybackEventShapes['COMMAND_STATE_CHANGED']
  ) => {
    this.session.api.playback.onStepUpdate.dispatchEvent(e)
  }

  handlePlaybackStateChanged = (
    e: PlaybackEventShapes['PLAYBACK_STATE_CHANGED']
  ) => {
    this.session.api.playback.onPlayUpdate.dispatchEvent(e)
    switch (e.state) {
      case 'aborted':
      case 'errored':
      case 'failed':
      case 'finished':
      case 'stopped':
        const playback = this.playback as Playback
        playback.cleanup()
        this.playback = null
        if (this.playingSuite) {
          this.playNextTest()
        }
    }
  }
}
