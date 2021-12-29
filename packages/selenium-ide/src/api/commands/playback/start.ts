import set from 'lodash/fp/set'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['playback']['start']

const setToPlay = set('state.status', 'playing')
export const mutator: Mutator<Shape> = (session) => setToPlay(session)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
