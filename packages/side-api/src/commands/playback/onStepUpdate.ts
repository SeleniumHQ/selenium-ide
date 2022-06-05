import { TestShape } from '@seleniumhq/side-model'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import merge from 'lodash/fp/merge'
import { getActiveTest, getCommandIndex } from '../../helpers/getActiveData'
import { BaseListener, EventMutator, StateShape } from '../../types'
import { EditorStateShape, PlaybackStateShape } from '../../models/state'

/**
 * Runs whenever a command begins, ends, errors, or breakpoints
 */
export type Shape = BaseListener<OnStepUpdatePlayback>

export type OnStepUpdatePlayback = [
  PlaybackEventShapes['COMMAND_STATE_CHANGED']
]

export type StateUpdateShape = Partial<
  Omit<StateShape, 'editor' | 'playback'>
> & {
  editor: Partial<EditorStateShape>
  playback: Partial<PlaybackStateShape>
}

const getHasCommand = (commandID: string) => (t: TestShape) =>
  t.commands.find((cmd) => cmd.id === commandID)

export const mutator: EventMutator<OnStepUpdatePlayback> = (
  session,
  [data]
) => {
  const stateUpdates: StateUpdateShape = {
    editor: {
      selectedCommandIndexes: [],
    },
    playback: {
      commands: { [data.id]: data },
    },
  }
  const isExecuting = data.state === 'executing'
  if (isExecuting) {
    const commandIndex = getCommandIndex(session, data.id)
    stateUpdates.playback.currentIndex = commandIndex
    stateUpdates.editor.selectedCommandIndexes = [commandIndex]
  }
  const test = getActiveTest(session)
  const hasCommand = getHasCommand(data.id)
  if (!hasCommand(test)) {
    const { tests } = session.project
    const nextActiveTest = tests.find(hasCommand) as TestShape
    stateUpdates.activeTestID = nextActiveTest.id
  } else {
    stateUpdates.activeTestID = test.id
  }
  stateUpdates.playback.testResults = {
    [stateUpdates.activeTestID]: {
      lastCommand: data.id,
    },
  }

  return merge(session, { state: stateUpdates })
}
