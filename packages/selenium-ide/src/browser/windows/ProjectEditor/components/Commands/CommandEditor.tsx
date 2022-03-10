import FormHelperText from '@mui/material/FormHelperText'
import Autocomplete from '@mui/material/Autocomplete'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { CommandShape } from '@seleniumhq/side-model'
import { CoreSessionData } from 'api/types'
import sideAPI from 'browser/helpers/getSideAPI'
import React, { FC, useMemo } from 'react'

export interface CommandEditorProps {
  command: CommandShape
  commands: CoreSessionData['state']['commands']
  testID: string
}

export interface MiniCommandShape {
  id: string
  name: string
}

const CommandEditor: FC<CommandEditorProps> = ({
  command,
  commands,
  testID,
}) => {
  const commandsList = useMemo(
    () => Object.entries(commands).map(([id, { name }]) => ({ id, name })),
    []
  )
  if (commandsList.length === 0) {
    return <Typography variant="subtitle1">Loading...</Typography>
  }
  const updateField = (name: string) => (e: any) => {
    console.log('Changing field ?', name, e.target.value)
    sideAPI.tests.updateStep(testID, command.id, {
      [name]: e.target.value,
    })
  }
  const updateFieldAutoComplete =
    (name: string) => (_e: any, value: string) => {
      sideAPI.tests.updateStep(testID, command.id, {
        [name]: value,
      })
    }
  if (command.id === '-1') {
    return (
      <Stack className="p-4" spacing={1}>
        <Typography className="centered pt-4" variant="body2">
          No active command selected
        </Typography>
      </Stack>
    )
  }
  const commandData = commands[command.command]
  return (
    <Stack className="p-4" spacing={1}>
      <FormControl>
        <InputLabel id="command-label">Command</InputLabel>
        <Select
          fullWidth
          label="Command"
          labelId="command-label"
          onChange={updateField('command')}
          size="small"
          value={command.command}
        >
          {commandsList.map((cmd) => (
            <MenuItem key={cmd.id} value={cmd.id}>
              {cmd.name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{commandData.description}</FormHelperText>
      </FormControl>
      <FormControl>
        <Autocomplete
          disabled={!commandData.target}
          freeSolo
          fullWidth
          inputValue={command.target}
          onChange={updateField('target')}
          onInputChange={updateFieldAutoComplete('target')}
          options={(command.targets ?? []).map((target) => target.join('='))}
          renderInput={(params) => (
            <TextField {...params} label="Target" name="target" />
          )}
          size="small"
          value={command.target}
        />
        <FormHelperText>{commandData.target?.description ?? ''}</FormHelperText>
      </FormControl>
      <FormControl>
        <TextField
          disabled={!commandData.value}
          label="Value"
          name="value"
          onChange={updateField('value')}
          size="small"
          value={command.value}
        />
        <FormHelperText>{commandData.value?.description ?? ''}</FormHelperText>
      </FormControl>
      <FormControl>
        <TextField
          label="Comment"
          name="comment"
          onChange={updateField('comment')}
          size="small"
          value={command.comment}
        />
      </FormControl>
    </Stack>
  )
}

export default CommandEditor
