import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen'
import Autocomplete from '@mui/material/Autocomplete'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import capitalize from 'lodash/fp/capitalize'
import React, { FC } from 'react'
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

  return (
    <FormControl>
      <div className="flex flex-row">
        <Autocomplete
          className="flex-1"
          freeSolo
          inputValue={command[fieldName]}
          componentsProps={{
            paper: {
              sx: {
                zIndex: 3000,
              },
            },
          }}
          onChange={updateTarget(testID, command.id)}
          onInputChange={updateTargetAutoComplete(testID, command.id)}
          options={(command[fieldNames] ?? []).map((entry) => entry.join('='))}
          renderInput={(params) => (
            <TextField {...params} label={FieldName} name={fieldName} />
          )}
          size="small"
          value={command[fieldName]}
        />
        <IconButton className="flex-fixed ml-4">
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
