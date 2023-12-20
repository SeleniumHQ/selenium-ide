import api from 'browser/api'
import { contextBridge } from 'electron'
import preload from './preload'

export default preload(api, () => {
  /**
   * Binds our API on initialization
   */
  process.once('loaded', async () => {
    /**
     * Expose it in the main context
     */
    contextBridge.exposeInMainWorld('sideAPI', window.sideAPI)
  })
})
