import { CommandShape } from '@seleniumhq/side-model'
import { CoreSessionData } from 'api/types'

export interface CommandEditorProps {
  command: CommandShape
  commands: CoreSessionData['state']['commands']
  testID: string
}

export interface CommandArgFieldProps extends CommandEditorProps {
  fieldName: 'target' | 'value'
}

export interface CommandFieldProps extends CommandEditorProps {
  fieldName: 'comment' | 'target' | 'value'
}

export interface MiniCommandShape {
  id: string
  name: string
}
