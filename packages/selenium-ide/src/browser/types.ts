import { Session } from 'main/types'
import Api from './api'

export type LoadedWindow = Window & typeof globalThis & { sideAPI: typeof Api }

export type CurriedApiField<Config extends any[], Shape> = (
  ...args: Config
) => (name: string, context: Session | LoadedWindow) => Shape
