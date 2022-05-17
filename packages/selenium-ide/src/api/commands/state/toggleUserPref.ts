import browserHandler from 'browser/api/classes/Handler'
import { UserPrefs } from 'api/types'
import update from 'lodash/fp/update'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import storage from 'main/store'
import { Mutator } from 'api/types'

export type Shape = (prefs: UserPrefs) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [userPrefs] }) =>
  update('state.userprefs', () => setUserPrefs(userPrefs), session)

export const setUserPrefs = (prefs: UserPrefs) => {
  storage.set<'userPrefs'>('userPrefs', prefs)
}

export const getUserPrefs = (): UserPrefs => {
  const userPrefs = {
    insertCommandPref: storage.get<'insertCommandPref'>('insertCommandPref')
      ? storage.get<'insertCommandPref'>('insertCommandPref')
      : 'After',
  } as UserPrefs
  return userPrefs
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
