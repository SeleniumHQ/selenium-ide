import set from 'lodash/fp/set'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { Session } from 'main/types'

export type Shape = Session['state']['toggleUserPrefTheme']

export const mutator: Mutator<Shape> = (
  session,
  { params: [themePref] }
) => set('state.userPrefs.themePref', themePref, session)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
