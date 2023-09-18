import { CommandShape, ProjectShape } from '@seleniumhq/side-model'
import BaseExecutor from './executor'

export { Capabilities } from 'selenium-webdriver'

/**
 * Modified command shape with additional execute function
 */
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

export type PluginHookInput = {
  logger: Console
  project: ProjectShape
} & Record<string, unknown>

export type GeneralHook<EXECUTOR, INPUT> = (
  this: EXECUTOR,
  input: INPUT
) => Promise<void> | void

export interface ExecutorPluginHooks<T extends BaseExecutor> {
  onBeforePlayAll?: GeneralHook<T, PluginHookInput>
  onAfterPlayAll?: GeneralHook<T, PluginHookInput>
  onMessage?: GeneralHook<T, PluginHookInput>
  onStoreWindowHandle?: GeneralHook<T, StoreWindowHandleHookInput>
  onWindowAppeared?: GeneralHook<T, WindowAppearedHookInput>
  onWindowSwitched?: GeneralHook<T, WindowSwitchedHookInput>
}

export interface FormatShape {
  opts?: {
    fileExtension?: string
    commandPrefixPadding?: string
    terminatingKeyword?: string
    commentPrefix?: string
  }
}
