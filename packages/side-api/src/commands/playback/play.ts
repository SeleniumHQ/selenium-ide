import omit from 'lodash/fp/omit'
import { Mutator } from '../../types/base'

/**
 * Start a running test, using a range to optionally control start
 * and end index
 */
export type Shape = (
  testID: string,
  playRange?: [number, number],
  forceNewPlayback?: boolean
) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, playRange = [0, -1]] }
) => ({
  ...session,
  state: {
    ...session.state,
    playback: {
      ...session.state.playback,
      commands:
        playRange[0] === 0
          ? omit(
              session.project.tests
                .find((t) => t.id === testID)
                ?.commands.map((cmd) => cmd.id)
                .slice(
                  playRange[0],
                  playRange[1] === -1 ? undefined : playRange[1]
                ) ?? [],
              session.state.playback.commands
            )
          : session.state.playback.commands,
    },
    status: 'playing',
    stopIndex: playRange[1],
  },
})
