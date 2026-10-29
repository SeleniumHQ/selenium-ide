import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CommandShape } from '@seleniumhq/side-model'
import { CoreSessionData } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import CommandSelector from './CommandFields/CommandSelector'
import ArgField from './CommandFields/ArgField'
import CommandTextField from './CommandFields/TextField'
import { FormattedMessage, useIntl } from 'react-intl'
import languageMap from 'browser/I18N/keys'

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
  const intl = useIntl()
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
    !(correctedCommand.command in commands) ||
    selectedCommandIndexes.length === 0
  ) {
    return (
      <Stack className="p-4" spacing={1}>
        <Typography className="centered py-4" variant="body2">
          {<FormattedMessage id={languageMap.testsTab.noCommandsSelected} />}
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
          <>
            <CommandTextField
              command={correctedCommand}
              {...props}
              fieldName={
                intl.formatMessage({
                  id: languageMap.testCore.windowHandleName,
                }) as 'windowHandleName'
              }
              note={intl.formatMessage({
                id: languageMap.testCore.windowHandleNameNote,
              })}
            />
            <CommandTextField
              command={correctedCommand}
              {...props}
              fieldName={
                intl.formatMessage({
                  id: languageMap.testCore.windowTimeout,
                }) as 'windowTimeout'
              }
              note={intl.formatMessage({
                id: languageMap.testCore.windowTimeoutNote,
              })}
            />
          </>
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
