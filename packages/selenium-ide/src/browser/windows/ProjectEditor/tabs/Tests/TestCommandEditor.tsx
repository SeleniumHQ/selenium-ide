import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CommandShape } from '@seleniumhq/side-model'
import { CoreSessionData } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import CommandSelector from './CommandFields/CommandSelector'
import ArgField from './CommandFields/ArgField'
import CommandTextField from './CommandFields/TextField'

export interface CommandEditorProps {
  command: CommandShape
  commands: CoreSessionData['state']['commands']
  disabled?: boolean
  selectedCommandIndexes: number[]
  testID: string
}

export interface MiniCommandShape {
  id: string
  name: string
}

const CommandEditor: FC<CommandEditorProps> = ({
  command,
  selectedCommandIndexes,
  ...props
}) => {
  if (typeof command.command != 'string') {
    command.command = '//unknown - could not process'
  }
  const { commands } = props
  const isDisabled = command.command.startsWith('//')
  const correctedCommand: CommandShape = {
    ...command,
    command: isDisabled ? command.command.slice(2) : command.command,
  }
  if (selectedCommandIndexes.length > 1) {
    return (
      <Stack className="p-4" spacing={1}>
        <Typography className="centered py-4" variant="body2">
          {selectedCommandIndexes.length} commands selected
        </Typography>
      </Stack>
    )
  }
  if (
    !commands[correctedCommand.command] ||
    selectedCommandIndexes.length === 0
  ) {
    return (
      <Stack className="p-4" spacing={1}>
        <Typography className="centered py-4" variant="body2">
          No commands selected
        </Typography>
      </Stack>
    )
  }
  return (
    <Paper className="z-4" elevation={5} square>
      <Stack className="flex-initial p-4" spacing={1}>
        <CommandSelector
          command={correctedCommand}
          isDisabled={isDisabled}
          {...props}
        />
        <ArgField command={correctedCommand} {...props} fieldName="target" />
        <ArgField command={correctedCommand} {...props} fieldName="value" />
        {command.opensWindow && (
          <CommandTextField
            command={correctedCommand}
            {...props}
            fieldName="windowHandleName"
            note="Variable name to set to the new window handle"
          />
        )}
        <CommandTextField
          command={correctedCommand}
          {...props}
          fieldName="comment"
          note=""
        />
      </Stack>
    </Paper>
  )
}

export default CommandEditor
