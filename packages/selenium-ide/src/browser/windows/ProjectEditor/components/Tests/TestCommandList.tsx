import { CommandShape } from '@seleniumhq/side-model'
import List from '@mui/material/List'
import { CommandsStateShape } from 'api/models/state/command'
import React, { FC } from 'react'
import CommandRow from './TestCommandRow'
import EditorToolbar from '../Drawer/EditorToolbar'

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
    subheader={
      <EditorToolbar
        disableGutters={false}
        sx={{ top: '96px', zIndex: 100 }}
        onAdd={() =>
          window.sideAPI.tests.addStep(
            activeTest,
            Math.max(
              commands.findIndex(({ id }) => id === activeCommand),
              0
            )
          )
        }
        onRemove={
          commands.length > 1
            ? () => window.sideAPI.tests.removeStep(activeTest, activeCommand)
            : undefined
        }
        text="Commands"
      />
    }
    sx={{
      borderColor: 'primary.main',
      marginBottom: `${bottomOffset}px`,
      marginTop: '48px',
    }}
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
