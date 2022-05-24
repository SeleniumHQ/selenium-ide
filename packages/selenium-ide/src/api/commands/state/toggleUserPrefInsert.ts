import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Mutator, UserPrefs } from 'api/types'
import { Session } from 'main/types'

export type Shape = Session['state']['toggleUserPrefInsert']

export const mutator: Mutator<Shape> = (session, { params: [insertCommandPref] }) =>
  update(
    'state.userprefs.insertCommandPref',
    (userPrefs: UserPrefs) =>
      userPrefs.insertCommandPref = insertCommandPref
      ,
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
