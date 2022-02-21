import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import { noop } from 'lodash/fp'
import React, { FC, useRef } from 'react'

const UncontrolledTextField: FC<TextFieldProps> = ({
  onChange = noop,
  value,
  ...props
}) => {
  const ref = useRef<HTMLInputElement>()
  const input = ref.current as HTMLInputElement
  React.useEffect(() => {
    if (input) {
      if (value !== input.value) {
        input.value = value as string
      }
    }
  }, [Boolean(input), value])
  return (
    <TextField
      defaultValue={value}
      inputRef={ref}
      margin="dense"
      onBlur={(event) => {
        onChange(event) 
        if (props.onBlur) {
          props.onBlur(event)
        }
      }}
      {...props}
    />
  )
}

export default UncontrolledTextField
