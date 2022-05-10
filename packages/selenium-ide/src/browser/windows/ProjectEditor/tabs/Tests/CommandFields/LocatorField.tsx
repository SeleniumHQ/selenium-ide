import HelpCenter from '@mui/icons-material/HelpCenter'
import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen'
import Autocomplete from '@mui/material/Autocomplete'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
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
  const label = fullnote ? FieldName + ' - ' + fullnote : FieldName

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
      <Autocomplete
        className="flex-1"
        freeSolo
        inputValue={localValue || ''}
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
          <TextField {...params} label={label} name={fieldName} />
        )}
        size="small"
        text-overflow="ellipsis"
        value={localValue || ''}
      />
      <IconButton
        className="ml-4"
        onClick={() =>
          window.sideAPI.recorder.requestSelectElement(true, fieldName)
        }
      >
        <AddToHomeScreenIcon />
      </IconButton>
      <Tooltip className="mx-2 my-auto" title={fullnote} placement="top-end">
        <HelpCenter />
      </Tooltip>
    </FormControl>
  )
}

export default CommandLocatorField
