import { HelpCenter } from '@mui/icons-material'
import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen'
import {
  Autocomplete,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material'
import capitalize from 'lodash/fp/capitalize'
import React, { FC, useEffect } from 'react'
import { updateField, updateFieldAutoComplete } from './utils'
import { CommandArgFieldProps } from '../types'

type PluralField = 'targets' | 'values'

const CommandLocatorField: FC<CommandArgFieldProps> = ({
  command,
  commands,
  fieldName,
  testID,
}) => {
  const fieldNames = (fieldName + 's') as PluralField
  const FieldName = capitalize(fieldName)

  const fullnote = commands[command.command][fieldName]?.description ?? ''
  let note = new String()
  let longNote = ''
  let isLongNote = false

  const truncateLength = 60

  if (fullnote.length > truncateLength) {
    isLongNote = true
    note = fullnote.substring(0, truncateLength) + '...'
    longNote = fullnote
  } else note = fullnote

  const updateTarget = updateField(fieldName)
  const updateTargetAutoComplete = updateFieldAutoComplete(fieldName)
  const [localValue, setLocalValue] = React.useState(command[fieldName])
  const onChange = (e: any) => {
    const el = e.target as HTMLInputElement
    setLocalValue(el.value)
    updateTarget(testID, command.id)(e)
  }
  const onChangeAutoComplete = (e: any, value: string) => {
    setLocalValue(value)
    updateTargetAutoComplete(testID, command.id)(e, value)
  }
  useEffect(() => {
    setLocalValue(command[fieldName])
  }, [command.id])

  return (
    <FormControl className="flex flex-row">
      <div className="flex-grow-1">
        <Autocomplete
          freeSolo
          inputValue={localValue}
          componentsProps={{
            paper: {
              sx: {
                zIndex: 3000,
              },
            },
          }}
          onChange={onChange}
          onContextMenu={() => {
            window.sideAPI.menus.open('textField')
          }}
          onInputChange={onChangeAutoComplete}
          options={(command[fieldNames] ?? []).map((entry) => entry.join('='))}
          renderInput={(params) => (
            <TextField
              {...params}
              label={FieldName + ' - ' + note}
              name={fieldName}
            />
          )}
          size="small"
          value={localValue}
        />
      </div>
      <IconButton
        className="ml-4"
        onClick={() =>
          window.sideAPI.recorder.requestSelectElement(true, fieldName)
        }
      >
        <AddToHomeScreenIcon />
      </IconButton>
      {isLongNote && (
        <Tooltip className="mx-2 my-auto" title={longNote} placement="top-end">
          <HelpCenter />
        </Tooltip>
      )}
      {/* <FormHelperText>
        {commandData[fieldName]?.description ?? ''}
      </FormHelperText> */}
    </FormControl>
  )
}

export default CommandLocatorField
