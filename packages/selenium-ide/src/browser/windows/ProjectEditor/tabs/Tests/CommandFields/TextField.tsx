import FormControl from '@mui/material/FormControl'
import { HelpCenter } from '@mui/icons-material'
import TextField from 'browser/components/UncontrolledTextField'
import capitalize from 'lodash/fp/capitalize'
import React, { FC } from 'react'
import { CommandFieldProps } from '../types'
import { updateField } from './utils'
import { Tooltip } from '@mui/material'

const CommandTextField: FC<CommandFieldProps> = ({
  commands,
  command,
  fieldName,
  testID,
}) => {
  const FieldName = capitalize(fieldName)
  const updateText = updateField(fieldName)

  const note =
    fieldName === 'comment'
      ? ''
      : ' - ' + commands[command.command]['description']

  return (
    <FormControl className="d-flex flex-row">
      <TextField
        text-overflow="ellipsis"
        className="flex-grow-1"
        sx={{ typography: 'subtitle2', color: 'red' }}
        id={`${fieldName}-${command.id}`}
        label={FieldName + note}
        name={fieldName}
        onChange={updateText(testID, command.id)}
        onContextMenu={() => {
          window.sideAPI.menus.open('textField')
        }}
        size="small"
        value={command[fieldName]}
      />
      <Tooltip
        text-overflow="ellipsis"
        className="mx-2 my-auto"
        title={note}
        placement="top-end"
      >
        <HelpCenter />
      </Tooltip>

      {/* {fieldName === 'comment' ? null : (
        <FormHelperText>
          {commands[command.command][fieldName]?.description ?? ''}
        </FormHelperText>
      )} */}
    </FormControl>
  )
}

export default CommandTextField
