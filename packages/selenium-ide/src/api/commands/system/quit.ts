import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'

export type Shape = (error: unknown) => Promise<void> 

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
