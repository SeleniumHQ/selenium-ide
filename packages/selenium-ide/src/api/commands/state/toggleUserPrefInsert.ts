import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { Session } from 'main/types'

export type Shape = Session['state']['toggleUserPrefInsert']

export const mutator: Mutator<Shape> = (
  session,
  { params: [insertCommandPref] }
) => ({
  ...session,
  state: {
    ...session.state,
    userPrefs: {
      ...session.state.userPrefs,
      insertCommandPref: insertCommandPref
    },
  },
})
export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
