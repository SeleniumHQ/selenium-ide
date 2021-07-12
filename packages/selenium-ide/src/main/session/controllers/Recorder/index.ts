import { Session } from 'main/types'

export default class RecorderController {
  constructor(session: Session) {
    this.session = session
  }
  currentStepIndex: null | number = null
  currentTest: null | string = null
  isRecording = false
  session: Session
  async start(testID: string, startIndex = 0) {
    this.currentTest = testID
    this.currentStepIndex = startIndex
    this.isRecording = true
  }
  async stop() {
    this.isRecording = false
    this.currentTest = null
    this.currentStepIndex = 0
  }
}
