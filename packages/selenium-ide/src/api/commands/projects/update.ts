import { ProjectShape } from '@seleniumhq/side-model'
import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { CoreSessionData, Mutator } from 'api/types'

export type Shape = Session['projects']['update']

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [updates] }
) =>
  update(`project`, (project: ProjectShape) => merge(project, updates), session)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
