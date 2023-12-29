import api from 'browser/api'
import { contextBridge } from 'electron'
import preload from './preload'

export const cb = () => new Promise<void>((resolve) => {
  /**
   * Binds our API on initialization
   */
  process.once('loaded', async () => {
    /**
     * Expose it in the main context
     */
    contextBridge.exposeInMainWorld('sideAPI', window.sideAPI)
    resolve()
  })
});

export default preload(api, cb)
