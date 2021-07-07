import { contextBridge } from 'electron'
import polyfill from '../polyfill'
import { LoadedWindow } from 'browser/types'

/**
 * Binds our API on initialization
 */
process.once('loaded', async () => {
  /**
   * Expose it in the main context
   */
  contextBridge.exposeInMainWorld('sideAPI', polyfill)
  /**
   * Expose it in the preload context as well
   */
  ;(window as LoadedWindow).sideAPI = polyfill
})
