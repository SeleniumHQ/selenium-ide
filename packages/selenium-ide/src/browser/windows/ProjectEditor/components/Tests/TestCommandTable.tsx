import { CommandShape } from '@seleniumhq/side-model'
import { CommandsStateShape } from 'api/models/state/command'
import useReorderPreview from 'browser/hooks/useReorderPreview'
import React, { FC } from 'react'
import CommandRow from './TestCommandRow'
import EditorToolbar from '../Drawer/EditorToolbar'
import makeKeyboundNav from 'browser/hooks/useKeyboundNav'
import ReorderableList from 'browser/components/ReorderableList'
import { Box } from '@mui/material'

export interface CommandListProps {
  activeTest: string
  bottomOffset: number
  commands: CommandShape[]
  commandStates: CommandsStateShape
  selectedCommandIndexes: number[]
}

const useKeyboundNav = makeKeyboundNav(window.sideAPI.state.updateTestSelection)

const CommandList: FC<CommandListProps> = ({
  activeTest,
  bottomOffset,
  commandStates,
  commands,
  selectedCommandIndexes,
}) => {
  const [preview, reorderPreview, resetPreview] = useReorderPreview(
    commands,
    selectedCommandIndexes,
    (c) => c.id
  )
  useKeyboundNav(commands, selectedCommandIndexes)
  return (
    <ReorderableList
      bottomOffset={bottomOffset}
      dense
      subheader={
        <EditorToolbar
          sx={{ top: '48px', zIndex: 100 }}
          onAdd={() =>
            window.sideAPI.tests.addSteps(
              activeTest,
              Math.max(selectedCommandIndexes.slice(-1)[0], 0)
            )
          }
          onRemove={
            commands.length > 1
              ? () =>
                  window.sideAPI.tests.removeSteps(
                    activeTest,
                    selectedCommandIndexes
                  )
              : undefined
          }
        >
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ flex: 0, flexBasis: 50 }}>&nbsp;</Box>
            <Box sx={{ flex: 1 }}>Cmd</Box>
            <Box sx={{ flex: 2, paddingLeft: 2 }}>Target</Box>
            <Box sx={{ flex: 2, paddingLeft: 2 }}>Value</Box>
          </Box>
        </EditorToolbar>
      }
    >
      {preview.map(([command, origIndex], index) => {
        if (!command) {
          return null
        }
        const { id } = command
        return (
          <CommandRow
            activeTest={activeTest}
            command={command}
            commandState={commandStates[id]}
            key={id}
            index={index}
            reorderPreview={reorderPreview}
            resetPreview={resetPreview}
            selected={selectedCommandIndexes.includes(origIndex)}
          />
        )
      })}
    </ReorderableList>
  )
}

export default CommandList
