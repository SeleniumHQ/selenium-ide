import browserHandler from 'browser/api/classes/Handler'
import { UserPrefs } from 'api/types'
import update from 'lodash/fp/update'
import mainHandler from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
// import { session } from 'electron'

export type Shape = (prefs: UserPrefs) => Promise<void>

export const mutator: Mutator<Shape> = (session) =>
  update(
    'state.userprefs.insertCommandPref',
    (pref) => (pref === 'Before' ? 'After' : 'Before'),
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
