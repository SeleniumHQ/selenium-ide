import { CommandShape, ProjectShape } from '@seleniumhq/side-model'
import { CommandType } from '@seleniumhq/side-model/src/Commands'
import WebDriverExecutor, { WebDriverExecutorHooks } from './webdriver'

export { Capabilities } from 'selenium-webdriver'

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

export type PluginHookInput = {
  logger: Console
  project: ProjectShape
} & Record<string, unknown>

export interface PluginHooks extends WebDriverExecutorHooks {
  onBeforePlayAll?: (input: PluginHookInput) => Promise<void>
  onAfterPlayAll?: (input: PluginHookInput) => Promise<void>
  onMessage?: (...args: any[]) => void
}

export interface FormatShape {
  opts?: {
    fileExtension?: string
    commandPrefixPadding?: string
    terminatingKeyword?: string
    commentPrefix?: string
  }
}

/**
 * A plugin is a javascript module that can be loaded into the Side Runner.
 * It can be used to extend the functionality of the Side Runner by adding new
 * commands, formats, or hooks.
 */

export interface PluginRuntimeShape {
  commands?: Record<string, CustomCommandShape>
  formats?: FormatShape[]
  hooks?: PluginHooks
}
