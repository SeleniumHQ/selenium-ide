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
  session: Session

  async pause() {
    this.isPlaying = false
  }
  async resume() {
    this.isPlaying = true
  }
  async start(testID: string, playRange = PlaybackController.defaultPlayRange) {
    this.playingTest = testID
    this.playRange = playRange
    this.isPlaying = true
  }
  async stop() {
    this.isPlaying = false
    this.currentStepIndex = 0
    this.playRange = PlaybackController.defaultPlayRange
    this.playingTest = ''
  }
}
