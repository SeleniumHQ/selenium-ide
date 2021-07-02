import { Session } from 'main/types'
import Polyfill from './polyfill'

export type LoadedWindow = Window &
  typeof globalThis & { sideAPI: typeof Polyfill }

export type CurriedApiField<Config extends any[], Shape> = (
  ...args: Config
) => (name: string, context: Session | LoadedWindow) => Shape
