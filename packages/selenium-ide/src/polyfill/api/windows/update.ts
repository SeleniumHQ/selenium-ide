import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'

export interface UpdateWindowOptions {
  focused?: boolean
}

export type Shape = (windowID: number, options: UpdateWindowOptions) => void

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(
  (_path, session) => async (windowID, options) => {
    const { windows } = session
    // Only our approved extension gets bootstrapped, for now
    if (options.focused) {
      windows.select(windowID)
    }
  }
)
