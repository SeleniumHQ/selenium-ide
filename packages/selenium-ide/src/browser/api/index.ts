import processApi from 'api/process'
import { Api } from 'api/index'
import { LoadedWindow } from 'browser/types'

/**
 * This Converts the chrome API type to something usable
 * from the front end
 */
export type BrowserApiMapper = {
  [Namespace in keyof Api]: {
    [Handler in keyof Api[Namespace]]: ReturnType<
      Api[Namespace][Handler]['browser']
    >
  }
}

export default processApi<BrowserApiMapper>((path, handler) =>
  handler.browser(path, window as LoadedWindow)
)
