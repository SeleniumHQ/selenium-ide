import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['playback']['pause']

export const mutator: Mutator<Shape> = (session) => {
  session.state.status = 'paused'
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
