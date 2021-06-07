const API = 1
const PROPERTY = 2
const METHOD = 3
const EVENT = 4

/**
 * This object is a compilation of the browser API that we're using:
 * This was compiled by going through the object using text search on `browser.` and recursively adding
 * properties and stuff, very exciting and not at all error-prone!
 */
const usedChromeExtensionAPI = {
  browserAction: {
    onClicked: EVENT,
  },
  contextMenus: {
    create: METHOD,
    removeAll: METHOD,
    onClicked: EVENT,
  },
  downloads: {
    download: METHOD,
  },
  extension: {
    getURL: METHOD,
  },
  runtime: {
    connect: METHOD,
    getURL: METHOD,
    getBackgroundPage: METHOD,
    sendMessage: METHOD,
    onConnect: EVENT,
    onMessage: EVENT,
    onMessageExternal: EVENT,
  },
  storage: {
    local: API,
  },
  tabs: {
    create: METHOD,
    get: METHOD,
    query: METHOD,
    remove: METHOD,
    sendMessage: METHOD,
    update: METHOD,
    onActivated: EVENT,
    onRemoved: EVENT,
    onUpdated: EVENT,
  },
  windows: {
    WINDOW_ID_NONE: PROPERTY,
    create: METHOD,
    getCurrent: METHOD,
    get: METHOD,
    remove: METHOD,
    update: METHOD,
    onFocusChanged: EVENT,
    onRemoved: EVENT,
  },
}

export default usedChromeExtensionAPI
