import { defaultPlaybackState } from '../../models'
import { Mutator } from '../../types'

/**
 * Start a running test, using a range to optionally control start
 * and end index
 */
export type Shape = (
  testID: string,
  playRange?: [number, number]
) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [_testID, playRange = [0, -1]] }
) => ({
  ...session,
  state: {
    ...session.state,
    playback:
      playRange[0] === 0 ? defaultPlaybackState : session.state.playback,
    status: 'playing',
    stopIndex: playRange[1],
  },
})
