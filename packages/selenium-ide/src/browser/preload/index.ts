import { contextBridge } from 'electron'
import api from '../api'
import { LoadedWindow } from 'browser/types'

/**
 * Binds our API on initialization
 */
process.once('loaded', async () => {
  /**
   * Expose it in the main context
   */
  contextBridge.exposeInMainWorld('sideAPI', api)
  /**
   * Expose it in the preload context as well
   */
  ;(window as LoadedWindow).sideAPI = api
})
