import curryN from 'lodash/fp/curryN'
import { ApiHandler, Session } from '../../../types'

/**
 * This code isn't used, but I kept it around
 * because this represents the right way that the client
 * requests elevated permission actions from Electron
 */

export default curryN(
  2,
  async ({ api, extension }: Session) =>
    // Add our Selenium IDE v3 page as a tab
    await api.server.tabs.add(
      `${extension.url}index.html`,
      'Selenium IDE Controller',
      { locked: true }
    )
) as ApiHandler
