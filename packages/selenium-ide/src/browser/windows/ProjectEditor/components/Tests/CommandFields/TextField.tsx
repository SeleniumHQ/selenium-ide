import { FormHelperText } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import capitalize from 'lodash/fp/capitalize'
import React, { FC } from 'react'
import { CommandFieldProps } from '../types'
import { updateField } from './utils'

const CommandTextField: FC<CommandFieldProps> = ({
  commands,
  command,
  fieldName,
  testID,
}) => {
  const FieldName = capitalize(fieldName)
  const updateText = updateField(fieldName)
  return (
    <FormControl>
      <TextField
        label={FieldName}
        name={fieldName}
        onChange={updateText(testID, command.id)}
        size="small"
        value={command[fieldName]}
      />
      {fieldName === 'comment' ? null : (
        <FormHelperText>
          {commands[command.command][fieldName]?.description ?? ''}
        </FormHelperText>
      )}
    </FormControl>
  )
}

export default CommandTextField
