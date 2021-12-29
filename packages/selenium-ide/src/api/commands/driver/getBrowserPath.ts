import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['driver']['getBrowserPath']

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
