import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { getActiveTest, getCommandIndex } from 'api/helpers/getActiveData'
import { EventMutator, StateShape } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import merge from 'lodash/fp/merge'
import mainEventListener from 'main/api/classes/EventListener'
import { EditorStateShape, PlaybackStateShape } from 'api/models/state'
import { TestShape } from '@seleniumhq/side-model'

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
  const test = getActiveTest(session)
  const command = getHasCommand(data.id)
  const stateUpdates: StateUpdateShape = {
    editor: {
      selectedCommandIndexes: [],
    },
    playback: {
      commands: { [data.id]: data },
      testResults: {
        [test.id]: {
          lastCommand: data.id,
        },
      },
    },
  }
  const isExecuting = data.state === 'executing'
  if (isExecuting) {
    const commandIndex = getCommandIndex(session, data.id)
    stateUpdates.playback.currentIndex = commandIndex
    stateUpdates.editor.selectedCommandIndexes = [commandIndex]
  }
  if (!command(test)) {
    const nextActiveTest = session.project.tests.find(command) as TestShape
    stateUpdates.activeTestID = nextActiveTest.id
    stateUpdates.playback.testResults = {
      [nextActiveTest.id]: {
        lastCommand: data.id,
      },
    }
  } else {
    stateUpdates.playback.testResults = {
      [test.id]: {
        lastCommand: data.id,
      },
    }
  }
  return merge(session, { state: stateUpdates })
}

export const browser = browserEventListener<OnStepUpdatePlayback>()
export const main = mainEventListener<OnStepUpdatePlayback>()
