const API = 1
const PROPERTY = 2
const METHOD = 3
const EVENT = 4

/**
 * This object is a graph of the browser API supported by electron for extensions:
 * https://www.electronjs.org/docs/api/extensions#supported-extensions-apis
 */
const supportedChromeExtensionAPI = {
  devTools: {
    inspectedWindow: API,
    network: API,
    panels: API,
  },
  extension: {
    lastError: PROPERTY,
    getURL: METHOD,
    getBackgroundPage: METHOD,
  },
  runtime: {
    lastError: PROPERTY,
    id: PROPERTY,
    getBackgroundPage: METHOD,
    getManifest: METHOD,
    getPlatformInfo: METHOD,
    getURL: METHOD,
    connect: METHOD,
    sendMessage: METHOD,
    onStartup: EVENT,
    onInstalled: EVENT,
    onSuspend: EVENT,
    onSuspendCanceled: EVENT,
    onConnect: EVENT,
    onMessage: EVENT,
  },
  storage: {
    local: API,
  },
  tabs: {
    sendMessage: METHOD,
    executeScript: METHOD,
  },
  management: {
    getAll: METHOD,
    get: METHOD,
    getSelf: METHOD,
    getPermissionWarningsById: METHOD,
    getPermissionWarningsByManifest: METHOD,
    onEnabled: EVENT,
    onDisabled: EVENT,
  },
  webRequest: API,
}

export default supportedChromeExtensionAPI
