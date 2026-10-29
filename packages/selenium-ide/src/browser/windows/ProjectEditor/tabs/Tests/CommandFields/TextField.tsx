import FormControl from '@mui/material/FormControl'
import HelpCenter from '@mui/icons-material/HelpCenter'
import TextField from 'browser/components/UncontrolledTextField'
import startCase from 'lodash/fp/startCase'
import React, { FC } from 'react'
import { CommandFieldProps } from '../types'
import { updateField } from './utils'
import Tooltip from '@mui/material/Tooltip'
import { LocatorFields } from '@seleniumhq/side-api'
import { useIntl } from 'react-intl'
import languageMap from 'browser/I18N/keys'

const inputLabelProps = {
  sx: {
    textOverflow: 'ellipsis',
  },
}

const CommandTextField: FC<CommandFieldProps> = ({
  command,
  disabled,
  fieldName,
  note,
  testID,
}) => {
  const intl = useIntl()
  const FieldName = startCase(fieldName)
  const updateText = updateField(fieldName)
  // 处理label标签
  const handleLabel = (value: string) => {
    switch (value) {
      case 'Comment':
        return intl.formatMessage({ id: languageMap.testCore.comment })
      case 'Target':
        return intl.formatMessage({ id: languageMap.testCore.target })
      case 'Value':
        return intl.formatMessage({ id: languageMap.testCore.value })
      default:
        return value
    }
  }
  // 一定会使用languageMap.commandMap,其实是为了兼容参数commands
  // Not every field has a description, for example the comment field
  const descriptionID = `commandMap.${command.command}.${fieldName}.description`
  const fullNote =
    note ||
    (descriptionID in intl.messages
      ? intl.formatMessage({ id: descriptionID })
      : '')
  const label = fullNote
    ? handleLabel(FieldName) + ' - ' + fullNote
    : handleLabel(FieldName)

  return (
    <FormControl className="flex flex-row">
      <TextField
        className="flex-1"
        disabled={disabled}
        id={`${fieldName}-${command.id}`}
        label={label}
        InputLabelProps={inputLabelProps}
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
