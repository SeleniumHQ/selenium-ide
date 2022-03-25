import { CommandShape } from '@seleniumhq/side-model'
import { CommandType } from '@seleniumhq/side-model/src/Commands'
import { Fn } from '@seleniumhq/side-commons/src/types'
import WebDriverExecutor from './webdriver'

export interface CommandNodeOptions {
  emitControlFlowEvent?: Fn
  isValidationDisabled?: boolean
}

/**
 * Modified command shape with additional execute function
 */
export interface CustomCommandShape extends CommandType {
  execute: (
    command: CommandShape,
    driver: WebDriverExecutor
  ) => Promise<boolean>
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

export interface PluginShape {
  commands?: Record<string, CustomCommandShape>
  hooks: {
    onAfterCommand?: (input: CommandHookInput) => void
    onBeforeCommand?: (input: CommandHookInput) => void
    onStoreWindowHandle?: (input: StoreWindowHandleHookInput) => void
    onWindowAppeared?: (input: WindowAppearedHookInput) => void
    onWindowSwitched?: (input: WindowSwitchedHookInput) => void
  }
}
