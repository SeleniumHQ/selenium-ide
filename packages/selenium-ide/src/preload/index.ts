import { contextBridge } from 'electron'
import api from './api'
import { LoadedWindow } from '../types'

/**
 * Binds our API on initialization
 */
process.once('loaded', async () => {
  /**
   * Expose it in the main context
   */
  contextBridge.exposeInMainWorld('seleniumIDE', api)
  /**
   * Expose it in the preload context as well
   */
  ;(window as LoadedWindow).seleniumIDE = api
})
