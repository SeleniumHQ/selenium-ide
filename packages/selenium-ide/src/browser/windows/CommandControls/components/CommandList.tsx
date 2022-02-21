import { CommandShape } from '@seleniumhq/side-model'
import { List, ListSubheader } from '@material-ui/core'
import { CommandsStateShape } from 'api/models/state/command'
import React, { FC } from 'react'
import CommandRow from './CommandRow'

export interface CommandListProps {
  activeCommand: string
  activeTest: string
  commands: CommandShape[]
  commandStates: CommandsStateShape
}

const CommandList: FC<CommandListProps> = ({
  activeCommand,
  activeTest,
  commandStates,
  commands,
}) => (
  <List
    className="pos-rel flex flex-col flex-1 overflow-y"
    dense
    sx={{
      borderColor: 'primary.main',
    }}
    subheader={
      <ListSubheader className="lh-36" sx={{ zIndex: 100 }}>
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
