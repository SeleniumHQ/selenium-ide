export type ApiHandler = (...args: any[]) => any

export interface ApiNamespaceShape {
  [key: string]: ApiHandler
}

export interface ApiShape {
  [key: string]: ApiNamespaceShape
}

export interface Api {
  client: ApiShape
  server: ApiShape
}

export interface Config {
  app: Electron.App
  window: Electron.BrowserWindow
  api: Api
  extension: Electron.Extension
}
