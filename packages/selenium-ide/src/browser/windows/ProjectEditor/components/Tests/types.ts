import { CommandShape } from '@seleniumhq/side-model'
import { CoreSessionData, LocatorFields } from 'api/types'

export interface CommandEditorProps {
  command: CommandShape
  commands: CoreSessionData['state']['commands']
  testID: string
}

export interface CommandArgFieldProps extends CommandEditorProps {
  fieldName: LocatorFields
}

export interface CommandFieldProps extends CommandEditorProps {
  fieldName: 'comment' | LocatorFields
}

export interface MiniCommandShape {
  id: string
  name: string
}
