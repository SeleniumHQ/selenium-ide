import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { ModifiedHandler } from 'main/api/classes/RawHandler'
import { Session } from 'main/types'

export type Shape = Session['recorder']['getFrameLocation']

export const browser = browserHandler<ModifiedHandler<Shape>>()

export const main = mainHandler<Shape>()
