import { CommandTypes } from '@seleniumhq/side-model/dist/Commands'
import badIndex from 'api/constants/badIndex'
import loadingID from 'api/constants/loadingID'

/**
 * State data is the data from the active IDE sessio that will not be persisted.
 * Playback state, breakpoints, status, whatever is from within a session
 */

export interface StateShape {
  activeCommand: string
  activeTest: string
  breakpoints: string[]
  commands: CommandTypes
  status: 'idle' | 'paused' | 'playing' | 'recording'
  playback: {
    tests: string[]
    currentTestIndex: number
    currentIndex: number
    stopIndex: number
  }
}

export type Shape = StateShape
const action: StateShape = {
  activeCommand: loadingID,
  activeTest: loadingID,
  breakpoints: [],
  commands: {},
  status: 'idle',
  playback: {
    tests: [],
    currentTestIndex: 0,
    currentIndex: badIndex,
    stopIndex: badIndex,
  },
}

export default action
