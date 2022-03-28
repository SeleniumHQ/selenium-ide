import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CommandShape } from '@seleniumhq/side-model'
import { CoreSessionData } from 'api/types'
import React, { FC } from 'react'
import CommandSelector from './CommandFields/CommandSelector'
import ArgField from './CommandFields/ArgField'
import CommandTextField from './CommandFields/TextField'

export interface CommandEditorProps {
  command: CommandShape
  commands: CoreSessionData['state']['commands']
  testID: string
}

export interface MiniCommandShape {
  id: string
  name: string
}

const CommandEditor: FC<CommandEditorProps> = (props) => {
  const { command } = props
  if (command.id === '-1') {
    return (
      <Stack className="p-4" spacing={1}>
        <Typography className="centered pt-4" variant="body2">
          No active command selected
        </Typography>
      </Stack>
    )
  }
  return (
    <Stack className="p-4" spacing={1}>
      <CommandSelector {...props} />
      <ArgField {...props} fieldName="target" />
      <ArgField {...props} fieldName="value" />
      <CommandTextField {...props} fieldName="comment" />
    </Stack>
  )
}

export default CommandEditor
