import CodeOffIcon from '@mui/icons-material/CodeOff'
import HelpCenterIcon from '@mui/icons-material/HelpCenter'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import React, { FC, useMemo } from 'react'
import { setField, updateField } from './utils'
import { CommandSelectorProps } from '../types'

const setCommandFactory = setField('command')
const updateCommand = updateField('command')
const CommandSelector: FC<CommandSelectorProps> = ({
  command,
  commands,
  isDisabled,
  testID,
}) => {
  const commandsList = useMemo(
    () =>
      Object.entries(commands)
        .map(([id, { name }]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  )
  if (commandsList.length === 0) {
    return null
  }
  const commandData = commands[command.command]
  const setCommand = setCommandFactory(testID, command.id)
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
        className="flex-fixed ml-5 my-auto"
        title={`${isDisabled ? 'En' :'Dis'}able this command`}
        placement="top-end"
      >
        <IconButton
          onClick={() =>
            setCommand(
              isDisabled ? command.command : `//${command.command}`
            )
          }
        >
          <CodeOffIcon color={isDisabled ? 'info' : 'inherit'} />
        </IconButton>
      </Tooltip>
      <Tooltip
        className="flex-fixed mx-2 my-auto"
        title={commandData.description}
        placement="top-end"
      >
        <HelpCenterIcon />
      </Tooltip>
    </FormControl>
  )
}

export default CommandSelector
