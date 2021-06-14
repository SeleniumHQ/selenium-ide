import curryN from 'lodash/fp/curryN'
import { ApiHandler, Session } from '../../../types'

export default curryN(
  2,
  async ({ window }: Session, path: string) =>
    await window.webContents.session.loadExtension(path)
) as ApiHandler
