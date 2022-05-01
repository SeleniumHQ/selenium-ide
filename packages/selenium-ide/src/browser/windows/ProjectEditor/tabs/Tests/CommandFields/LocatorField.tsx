import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen'
import Autocomplete from '@mui/material/Autocomplete'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
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
  const commandData = commands[command.command]
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
    <FormControl>
      <div className="flex flex-row">
        <Autocomplete
          className="flex-1"
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
            <TextField {...params} label={FieldName} name={fieldName} />
          )}
          size="small"
          value={localValue}
        />
        <IconButton
          className="flex-fixed ml-4"
          onClick={() =>
            window.sideAPI.recorder.requestSelectElement(true, fieldName)
          }
        >
          <AddToHomeScreenIcon />
        </IconButton>
      </div>
      <FormHelperText>
        {commandData[fieldName]?.description ?? ''}
      </FormHelperText>
    </FormControl>
  )
}

export default CommandLocatorField
