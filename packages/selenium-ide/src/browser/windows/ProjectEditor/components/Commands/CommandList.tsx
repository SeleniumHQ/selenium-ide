import { CommandShape } from '@seleniumhq/side-model'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import { CommandsStateShape } from 'api/models/state/command'
import React, { FC } from 'react'
import CommandRow from './CommandRow'

export interface CommandListProps {
  activeCommand: string
  activeTest: string
  bottomOffset: number
  commands: CommandShape[]
  commandStates: CommandsStateShape
}

const CommandList: FC<CommandListProps> = ({
  activeCommand,
  activeTest,
  bottomOffset,
  commandStates,
  commands,
}) => (
  <List
    dense
    sx={{
      borderColor: 'primary.main',
      marginBottom: `${bottomOffset + 10}px`,
      marginTop: '48px',
    }}
    subheader={
      <ListSubheader className="lh-36" sx={{ top: '96px', zIndex: 100 }}>
        Commands
      </ListSubheader>
    }
  >
    {commands.map((command, index) => {
      const { id } = command
      return (
        <CommandRow
          activeTest={activeTest}
          command={command}
          commandState={commandStates[id]}
          key={id}
          index={index}
          selected={id === activeCommand}
        />
      )
    })}
  </List>
)

export default CommandList
