import set from 'lodash/fp/set'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['state']['setActiveTest']

const setActiveTestID = set('state.activeTestID')
export const mutator: Mutator<Shape> = (session, { params: [activeTestID] }) =>
  setActiveTestID(activeTestID, session)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
