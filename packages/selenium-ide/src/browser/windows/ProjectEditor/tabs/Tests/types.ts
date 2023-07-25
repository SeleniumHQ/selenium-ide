import { CommandShape } from '@seleniumhq/side-model'
import { CoreSessionData, LocatorFields } from '@seleniumhq/side-api'

export interface CommandEditorProps {
  command: CommandShape
  commands: CoreSessionData['state']['commands']
  testID: string
}

export type CommandSelectorProps = CommandEditorProps & {
  isDisabled: boolean
}

export interface CommandArgFieldProps extends CommandEditorProps {
  fieldName: LocatorFields
}

export interface CommandFieldProps extends CommandEditorProps {
  fieldName: 'comment' | 'windowHandleName' | LocatorFields
  note?: string
}

export interface MiniCommandShape {
  id: string
  name: string
}
