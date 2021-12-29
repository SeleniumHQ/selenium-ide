import set from 'lodash/fp/set'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['recorder']['start']

const setToRecording = set('state.status', 'recording')
export const mutator: Mutator<Shape> = (session) => setToRecording(session)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
