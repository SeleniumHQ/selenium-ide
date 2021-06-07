import curryN from 'lodash/fp/curryN'
import { ApiHandler, Config } from '../../types'

/**
 * This code isn't used, but I kept it around
 * because this represents the right way that the client
 * requests elevated permission actions from Electron
 */

export default curryN(
  2,
  async ({ window }: Config, path: string) =>
    await window.webContents.session.loadExtension(path)
) as ApiHandler
