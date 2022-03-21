import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { getCommandIndex } from 'api/helpers/getActiveData'
import { EventMutator } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import merge from 'lodash/fp/merge'
import mainEventListener from 'main/api/classes/EventListener'
import { PlaybackStateShape } from 'api/models/state'

export type OnStepUpdatePlayback = [
  PlaybackEventShapes['COMMAND_STATE_CHANGED']
]

export const mutator: EventMutator<OnStepUpdatePlayback> = (
  session,
  [data]
) => {
  const playbackUpdates: Partial<PlaybackStateShape> = {
    commands: { [data.id]: data.state },
  }
  if (data.state === 'executing') {
    playbackUpdates.currentIndex = getCommandIndex(
      session,
      data.id
    )
  }
  return merge(session, { state: { playback: playbackUpdates }})
}

export const browser = browserEventListener<OnStepUpdatePlayback>()
export const main = mainEventListener<OnStepUpdatePlayback>()
