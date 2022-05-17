import browserHandler from 'browser/api/classes/Handler'
import update from 'lodash/fp/update'
import mainHandler from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import {Session} from 'main/types'

export type Shape = Session['state']['toggleUserPref'];

export const mutator: Mutator<Shape> = (session) =>
  update(
    'state.insertCommandPref',
    (pref) => (pref === 'Before' ? 'After' : 'Before'),
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
