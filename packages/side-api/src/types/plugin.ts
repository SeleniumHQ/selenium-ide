import { ProjectShape } from '@seleniumhq/side-model'
import { PluginHooks, PluginRuntimeShape } from '@seleniumhq/side-runtime'
import { Api } from './api'
import { CoreSessionData, RecordNewCommandInput } from './base'

export interface onCommandRecordedDropResult {
  action: 'drop'
}
export interface OnCommandRecordedUpdateResult {
  action: 'update'
  command: RecordNewCommandInput
}

export type OnCommandRecordedResult =
  | void
  | onCommandRecordedDropResult
  | OnCommandRecordedUpdateResult

export type PluginHookInput = {
  logger: Console
  project: ProjectShape
} & Record<string, unknown>

export type PluginMenuConfigurator = (api: Api) => void

export interface PluginPreloadOutputShape {
  hooks: {
    onCommandRecorded?: (
      command: RecordNewCommandInput,
      event: Event | KeyboardEvent | MouseEvent | MutationRecord[] | undefined
    ) => OnCommandRecordedResult
  }
}

export type SendMessage = (...args: any[]) => void

export type PluginPreloadShape = (
  sendMessage: SendMessage
) => PluginPreloadOutputShape

export interface PluginHooksShape extends PluginHooks {
  onLoad?: (api: Api) => Promise<void>
  onUnload?: (api: Api) => Promise<void>
}

export type PluginMenuShape = (
  session: CoreSessionData
) => Promise<(Electron.MenuItemConstructorOptions | Electron.MenuItem)[]>

export type PluginMenusShape = Record<string, PluginMenuShape>

export interface PluginShape extends PluginRuntimeShape {
  hooks?: PluginHooksShape
  menus?: PluginMenuShape
}
