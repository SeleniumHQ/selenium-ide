import { Playback, PlaybackEvents, Variables } from '@seleniumhq/side-runtime'
import { Session } from 'main/types'

export default class PlaybackController {
  constructor(session: Session) {
    this.session = session
  }
  static defaultPlayRange = [0, -1]
  currentStepIndex: null | number = null
  isPlaying = false
  playRange = [0, -1]
  playingTest = ''
  playback?: Playback
  session: Session

  async pause() {
    this.isPlaying = false
  }
  async resume() {
    this.isPlaying = true
  }
  async play(testID: string, playRange = PlaybackController.defaultPlayRange) {
    this.playingTest = testID
    this.playRange = playRange
    this.isPlaying = true
    await this.session.driver.build({})
    const playback = new Playback({
      baseUrl: this.session.projects.project.url,
      executor: this.session.driver.driver,
      getTestByName: (name: string) => this.session.tests.getByName(name),
      logger: console,
      variables: new Variables(),
    })
    Object.keys(PlaybackEvents).forEach((key) => {
      playback['event-emitter'].addListener(key, (event) => {
        console.log('Event', key, event)
      })
    })
    playback.play(this.session.tests.getByID(testID), {
      startingCommandIndex: playRange[0],
    })
    this.playback = playback
  }
  async stop() {
    this.isPlaying = false
    this.currentStepIndex = 0
    this.playRange = PlaybackController.defaultPlayRange
    this.playingTest = ''
  }
}
