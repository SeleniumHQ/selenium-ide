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
  }
  static defaultPlayRange = [0, -1]
  currentStepIndex: null | number = null
  isPlaying = false
  playRange = [0, -1]
  playingTest = ''
  // @ts-expect-error
  playback: Playback
  session: Session

  async pause() {
    this.isPlaying = false
    await this.playback.pause()
  }
  async resume() {
    this.isPlaying = true
    this.playback.resume()
  }
  async play(testID: string, playRange = PlaybackController.defaultPlayRange) {
    this.playingTest = testID
    this.playRange = playRange
    this.isPlaying = true
    const playback = new Playback({
      baseUrl: this.session.projects.project.url,
      executor: this.session.driver.driver,
      getTestByName: (name: string) => this.session.tests.getByName(name),
      logger: console,
      playbackWindow: await this.session.windows.get('playback-window'),
      variables: new Variables(),
    })
    this.playback = playback
    playback['event-emitter'].addListener(
      PlaybackEvents.PLAYBACK_STATE_CHANGED,
      this.handlePlaybackStateChanged
    )
    playback.play(this.session.tests.getByID(testID), {
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
    switch (e.state) {
      case 'prep':
        this.playback['event-emitter'].addListener(
          PlaybackEvents.COMMAND_STATE_CHANGED,
          this.handleCommandStateChanged
        )
        break
      case 'aborted':
      case 'breakpoint':
      case 'errored':
      case 'failed':
      case 'finished':
      case 'stopped':
        this.playback['event-emitter'].removeListener(
          PlaybackEvents.COMMAND_STATE_CHANGED,
          this.handleCommandStateChanged
        )
    }
    this.session.api.playback.onPlayUpdate.dispatchEvent(e)
  }

  async stop() {
    this.isPlaying = false
    this.currentStepIndex = 0
    this.playRange = PlaybackController.defaultPlayRange
    this.playingTest = ''
  }
}
