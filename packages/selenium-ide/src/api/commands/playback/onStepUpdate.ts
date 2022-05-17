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

export type StateUpdateShape =
  Partial<Omit<StateShape, 'editor' | 'playback'>> & {
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
  }

  return merge(session, { state: stateUpdates })
}

export const browser = browserEventListener<OnStepUpdatePlayback>()
export const main = mainEventListener<OnStepUpdatePlayback>()
