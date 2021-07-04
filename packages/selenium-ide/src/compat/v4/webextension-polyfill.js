import { userAgent } from '@seleniumhq/side-utils'
import merge from 'lodash/fp/merge'
import _browser from 'webextension-polyfill'

export default (userAgent.isElectron ? injectPolyfill(_browser) : _browser)

/**
 * So in v4 we moved to Electron
 * which only supports a subset of the extension API
 * So the rest we need to polyfill ourselves
 */
function injectPolyfill(browser) {
  /**
   * Here we write our supported browser methods to chrome
   * Next we write our polyfills to our shared object
   * As a result, we should cover the entire API described in
   * chrome-used-api.js
   */
  return merge(browser, window.sideAPI)
}
