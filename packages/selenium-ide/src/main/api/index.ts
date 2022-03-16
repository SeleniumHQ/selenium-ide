import { Api } from 'api/index'
import processApi from 'api/process'
import { Session } from 'main/types'
import { ipcMain } from 'electron'

export type MainApiMapper = {
  [Namespace in keyof Api]: {
    [Handler in keyof Api[Namespace]]: ReturnType<
      Api[Namespace][Handler]['main']
    >
  }
}

export default (session: Session) => {
  ipcMain.removeAllListeners()
  return processApi<MainApiMapper>((name, handler) => {
    if (handler.main) {
      return handler.main(name, session, handler.mutator)
    }
  })
}
