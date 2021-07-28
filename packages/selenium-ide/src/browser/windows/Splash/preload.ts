import { contextBridge } from 'electron'
import api from 'browser/api'

/**
 * Binds our API on initialization
 */
process.once('loaded', async () => {
  /**
   * Expose it in the main context
   */
  contextBridge.exposeInMainWorld('sideAPI', api)
})
