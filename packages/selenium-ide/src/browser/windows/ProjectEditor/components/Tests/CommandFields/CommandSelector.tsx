import HelpCenterIcon from '@mui/icons-material/HelpCenter'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import React, { FC, useMemo } from 'react'
import { updateField } from './utils'
import { CommandEditorProps } from '../types'

const updateCommand = updateField('command')
const CommandSelector: FC<CommandEditorProps> = ({
  command,
  commands,
  testID,
}) => {
  const commandsList = useMemo(
    () => Object.entries(commands).map(([id, { name }]) => ({ id, name })),
    []
  )
  if (commandsList.length === 0) {
    return null
  }
  const commandData = commands[command.command]
  return (
    <FormControl className="flex flex-row">
      <InputLabel id="command-label">Command</InputLabel>
      <Select
        className="flex-1"
        label="Command"
        labelId="command-label"
        MenuProps={{
          sx: {
            zIndex: 3000,
          },
        }}
        onChange={updateCommand(testID, command.id)}
        size="small"
        value={command.command}
      >
        {commandsList.map((cmd) => (
          <MenuItem key={cmd.id} value={cmd.id}>
            {cmd.name}
          </MenuItem>
        ))}
      </Select>
      <Tooltip
        className="flex-fixed ml-5 mr-2 my-auto"
        title={commandData.description}
        placement="top-end"
      >
        <HelpCenterIcon />
      </Tooltip>
    </FormControl>
  )
}

export default CommandSelector
