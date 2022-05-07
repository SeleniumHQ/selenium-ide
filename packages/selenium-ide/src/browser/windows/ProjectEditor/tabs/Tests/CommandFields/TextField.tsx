import FormControl from '@mui/material/FormControl'
import HelpCenter from '@mui/icons-material/HelpCenter'
import TextField from 'browser/components/UncontrolledTextField'
import capitalize from 'lodash/fp/capitalize'
import React, { FC } from 'react'
import { CommandFieldProps } from '../types'
import { updateField } from './utils'
import Tooltip from '@mui/material/Tooltip'

const CommandTextField: FC<CommandFieldProps> = ({
  commands,
  command,
  fieldName,
  testID,
}) => {
  const FieldName = capitalize(fieldName)
  const updateText = updateField(fieldName)
  const isComment = fieldName === 'comment'
  const fullnote = isComment ? '' : commands[command.command][fieldName]?.description ?? ''
  const label = fullnote ? FieldName + ' - ' + fullnote : FieldName

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
        value={command[fieldName]}
      />
      {!isComment && (
        <Tooltip className="mx-2 my-auto" title={fullnote} placement="top-end">
          <HelpCenter />
        </Tooltip>
      )}
    </FormControl>
  )
}

export default CommandTextField
