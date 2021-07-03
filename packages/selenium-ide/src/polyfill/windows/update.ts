import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'

export interface UpdateWindowOptions {
  focused?: boolean
}

export type Shape = (
  windowID: number,
  options: UpdateWindowOptions
) => Promise<void>

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
