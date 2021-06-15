import { ClientApi } from '../preload/api'

export type LoadedWindow = Window &
  typeof globalThis & { seleniumIDE: ClientApi }
