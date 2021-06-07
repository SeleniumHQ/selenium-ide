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

export type LoadedWindow = Window & typeof globalThis & { seleniumIDE: Api }
