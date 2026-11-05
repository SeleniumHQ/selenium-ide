import TextField, { TextFieldProps } from '@mui/material/TextField'
import { noop } from 'lodash/fp'
import React, { FC } from 'react'

/**
 * This is actually a hyper controlled text field
 */
const UncontrolledTextField: FC<TextFieldProps> = ({
  value = '',
  onChange: _onChange = noop,
  ...props
}) => {
  const [localValue, setLocalValue] = React.useState(value)
  // Start from the new value when the field shows another item
  const [fieldId, setFieldId] = React.useState(props.id)
  if (props.id !== fieldId) {
    setFieldId(props.id)
    setLocalValue(value)
  }
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const el = e.target as HTMLInputElement
    setLocalValue(el.value)
    _onChange(e)
  }
  return (
    <TextField
      margin="dense"
      onChange={onChange}
      value={localValue}
      {...props}
    />
  )
}

export default UncontrolledTextField
