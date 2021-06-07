import browser from 'webextension-polyfill'
import polyfill from './polyfill'
import supportedChromeExtensionAPI from './supported-chrome-api'

const isElectron = navigator.userAgent.includes('Electron')
export default (isElectron ? getPolyfill() : browser)

/**
 * So in v4 we moved to Electron
 * which only supports a subset of the extension API
 * So the rest we need to polyfill ourselves
 */
function getPolyfill() {
  /**
   * Here we write our supported browser methods to our shared object
   * Next we write our polyfills to our shared object
   * As a result, we should cover the entire API described in
   * chrome-used-api.js
   */
  const browserWithPolyfills = {}
  Object.keys(supportedChromeExtensionAPI).forEach(namespace => {
    const cache = (browserWithPolyfills[namespace] = {})
    if (!browser[namespace]) return
    console.debug('Using browser builtin', namespace, browser[namespace])
    Object.keys(supportedChromeExtensionAPI[namespace]).forEach(entry => {
      cache[entry] = browser[namespace][entry]
    })
  })
  Object.keys(polyfill).forEach(namespace => {
    let cache = browserWithPolyfills[namespace]
    if (!cache) {
      cache = browserWithPolyfills[namespace] = {}
    }
    console.debug('Using polyfill', namespace, polyfill[namespace])
    Object.keys(polyfill[namespace]).forEach(entry => {

      browserWithPolyfills[namespace][entry] = polyfill[namespace][entry]
    })
  })
  return browserWithPolyfills
}
