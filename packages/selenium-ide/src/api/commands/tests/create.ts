import { ProjectShape, TestShape } from '@seleniumhq/side-model'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['tests']['create']

export function mutator(project: ProjectShape, test: TestShape) {
  project.tests.push(test)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
