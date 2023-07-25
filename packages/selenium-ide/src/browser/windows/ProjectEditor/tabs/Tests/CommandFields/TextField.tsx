import FormControl from '@mui/material/FormControl'
import HelpCenter from '@mui/icons-material/HelpCenter'
import TextField from 'browser/components/UncontrolledTextField'
import startCase from 'lodash/fp/startCase'
import React, { FC } from 'react'
import { CommandFieldProps } from '../types'
import { updateField } from './utils'
import Tooltip from '@mui/material/Tooltip'
import { LocatorFields } from '@seleniumhq/side-api'

const CommandTextField: FC<CommandFieldProps> = ({
  commands,
  command,
  fieldName,
  note,
  testID,
}) => {
  const FieldName = startCase(fieldName)
  const updateText = updateField(fieldName)
  const fullNote =
    (note ||
      commands[command.command][fieldName as LocatorFields]?.description) ??
    ''
  const label = fullNote ? FieldName + ' - ' + fullNote : FieldName

  return (
    <FormControl className="flex flex-row">
      <TextField
        className="flex-1"
        id={`${fieldName}-${command.id}`}
        label={label}
        InputLabelProps={{
          sx: {
            textOverflow: 'ellipsis',
          },
        }}
        name={fieldName}
        onChange={updateText(testID, command.id)}
        onContextMenu={() => {
          window.sideAPI.menus.open('textField')
        }}
        size="small"
        value={command[fieldName as LocatorFields]}
      />
      {fullNote && (
        <Tooltip className="mx-2 my-auto" title={fullNote} placement="top-end">
          <HelpCenter />
        </Tooltip>
      )}
    </FormControl>
  )
}

export default CommandTextField
