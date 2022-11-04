import { CommandShape } from '@seleniumhq/side-model'
import { CommandType } from '@seleniumhq/side-model/src/Commands'
import { Fn } from '@seleniumhq/side-commons/src/types'
import WebDriverExecutor, { WebDriverExecutorHooks } from './webdriver'

export { Capabilities } from 'selenium-webdriver'

export interface CommandNodeOptions {
  emitControlFlowChange?: Fn
  isValidationDisabled?: boolean
}

/**
 * Modified command shape with additional execute function
 */
export interface CustomCommandShape extends CommandType {
  execute: (command: CommandShape, driver: WebDriverExecutor) => Promise<void>
}

export interface CommandHookInput {
  command: CommandShape
}

export interface StoreWindowHandleHookInput {
  windowHandle: string
  windowHandleName: string
}

export interface WindowAppearedHookInput {
  command: CommandShape
  windowHandleName: CommandShape['windowHandleName']
  windowHandle: string
}

export interface WindowSwitchedHookInput {
  windowHandle: string
}

export interface NewCommandShape {
  command: string
  target: string | [string, string][]
  value: string | [string, string][]
  insertBeforeLastCommand: boolean
  frameLocation: string
}

export interface onCommandRecordedDropResult {
  action: 'drop'
}
export interface OnCommandRecordedUpdateResult {
  action: 'update'
  command: NewCommandShape
}

export type OnCommandRecordedResult =
  | void
  | onCommandRecordedDropResult
  | OnCommandRecordedUpdateResult

export interface PluginHooks extends WebDriverExecutorHooks {
  onBeforePlayAll?: () => Promise<void>
  onMessage?: (...args: any[]) => void
}

export interface PluginShape {
  commands?: Record<string, CustomCommandShape>
  hooks: PluginHooks
}

export interface PluginPreloadOutputShape {
  hooks: {
    onCommandRecorded?: (
      command: NewCommandShape,
      event: Event | KeyboardEvent | MouseEvent | MutationRecord[] | undefined
    ) => OnCommandRecordedResult
  }
}

export type SendMessage = (...args: any[]) => void

export type PluginPreloadShape = (
  sendMessage: SendMessage
) => PluginPreloadOutputShape
