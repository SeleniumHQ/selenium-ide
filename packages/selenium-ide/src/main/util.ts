import { app } from 'electron'
import { debuglog, inspect } from 'util'

export const COLOR_BLACK = '\x1b[30m'
export const COLOR_RED = '\x1b[31m'
export const COLOR_GREEN = '\x1b[32m'
export const COLOR_YELLOW = '\x1b[33m'
export const COLOR_BLUE = '\x1b[34m'
export const COLOR_MAGENTA = '\x1b[35m'
export const COLOR_CYAN = '\x1b[36m'
export const COLOR_WHITE = '\x1b[37m'

export const isAutomated = process.argv.includes('--enable-automation')

export const vdebuglog = (namespace: string, color: string) => {
  const isBin = app.isPackaged
  const prefix = isBin ? `${namespace}: ` : color
  const log = isBin ? console.log : debuglog(namespace)
  const suffix = isBin ? '' : '\x1b[0m'
  return (...args: any[]) => {
    const str = args.map((v) => inspect(v)).join(' ')
    log(`${prefix}${str}${suffix}`)
  }
}

export const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration))