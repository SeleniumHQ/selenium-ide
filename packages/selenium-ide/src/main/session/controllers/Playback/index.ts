import {
  Playback,
  PlaybackEvents,
  PlaybackEventShapes,
  Variables,
} from '@seleniumhq/side-runtime'
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
  playingTest = ''
  playback: Playback | null
  session: Session

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
    }
  }
}
