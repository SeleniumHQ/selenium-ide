import FormControl from '@mui/material/FormControl'
import { HelpCenter } from '@mui/icons-material'
import TextField from 'browser/components/UncontrolledTextField'
import capitalize from 'lodash/fp/capitalize'
import React, { FC } from 'react'
import { CommandFieldProps } from '../types'
import { updateField } from './utils'
import {
  Tooltip,
} from '@mui/material'

const CommandTextField: FC<CommandFieldProps> = ({
  commands,
  command,
  fieldName,
  testID,
}) => {
  const FieldName = capitalize(fieldName)
  const updateText = updateField(fieldName)

  const fullnote =   
    fieldName === 'comment'
      ? ''
      : ' - ' + commands[command.command]['description']
    
  let note = new String()
  let longNote = ''
  let isLongNote = false
  const truncateLength = 60

  if (fullnote.length > truncateLength) {
    isLongNote = true
    note = fullnote.substring(0, truncateLength) + '...'
    longNote = fullnote
  } else note = fullnote
  
  return (
    <FormControl className="d-flex flex-row">
      <div className="flex-grow-1">
        <TextField
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
      </div>
      {isLongNote && (
        <Tooltip className="mx-2 my-auto" title={longNote} placement="top-end">
          <HelpCenter />
        </Tooltip>
      )}

      {/* {fieldName === 'comment' ? null : (
        <FormHelperText>
          {commands[command.command][fieldName]?.description ?? ''}
        </FormHelperText>
      )} */}
    </FormControl>
  )
}

export default CommandTextField
