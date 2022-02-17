import { Grid } from '@material-ui/core'
import Autocomplete from '@material-ui/core/Autocomplete'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Stack from '@material-ui/core/Stack'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
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
      <Stack
        className="flex flex-initial flex-col p-4 bt"
        sx={{ borderColor: 'primary.main' }}
        spacing={1}
      >
        <Typography className="centered pt-4" variant="body2">
          No active command selected
        </Typography>
      </Stack>
    )
  }
  return (
    <Grid className="outside-v-nav" container spacing={0}>
      <Grid item xs={6}>
        <Stack
          className="flex flex-initial flex-col p-4 bt"
          sx={{ borderColor: 'primary.main' }}
          spacing={1}
        >
          <FormControl>
            <InputLabel id="command-label">Command</InputLabel>
            <Select
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
          </FormControl>
          <FormControl>
            <TextField
              label="Value"
              onChange={updateField('value')}
              size="small"
              value={command.value}
            />
          </FormControl>
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Stack
          className="flex flex-initial flex-col p-4 bt"
          sx={{ borderColor: 'primary.main' }}
          spacing={1}
        >
          <FormControl>
            <Autocomplete
              freeSolo
              inputValue={command.target}
              onChange={updateField('target')}
              onInputChange={updateFieldAutoComplete('target')}
              options={(command.targets ?? []).map((target) => target[0])}
              renderInput={(params) => (
                <TextField {...params} label="Target" size="small" />
              )}
              size="small"
              value={command.target}
            />
          </FormControl>
          <FormControl>
            <TextField
              label="Comment"
              onChange={updateField('comment')}
              size="small"
              value={command.comment}
            />
          </FormControl>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default CommandEditor
