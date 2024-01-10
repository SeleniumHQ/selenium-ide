import { CommandShape } from '@seleniumhq/side-model'
import { CommandsStateShape } from '@seleniumhq/side-api'
import useReorderPreview from 'browser/hooks/useReorderPreview'
import React, { FC } from 'react'
import CommandRow from './TestCommandRow'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import makeKeyboundNav from 'browser/hooks/useKeyboundNav'
import ReorderableList from 'browser/components/ReorderableList'
import { Box } from '@mui/material'

export interface CommandListProps {
  activeTest: string
  commands: CommandShape[]
  commandStates: CommandsStateShape
  disabled?: boolean
  selectedCommandIndexes: number[]
}

const useKeyboundNav = makeKeyboundNav(window.sideAPI.state.updateStepSelection)

const CommandList: FC<CommandListProps> = ({
  activeTest,
  commandStates,
  commands,
  disabled,
  selectedCommandIndexes,
}) => {
  const [preview, reorderPreview, resetPreview] = useReorderPreview(
    commands,
    selectedCommandIndexes,
    (c) => c.id
  )
  useKeyboundNav(commands, selectedCommandIndexes)
  return (
    <>
      <EditorToolbar
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
          <Box className="flex" sx={{ flex: 0, flexBasis: 50 }}>&nbsp;</Box>
          <Box className="flex" sx={{ flex: 1 }}>Cmd</Box>
          <Box className="flex" sx={{ flex: 2, paddingLeft: 2 }}>Target</Box>
          <Box className="flex" sx={{ flex: 2, paddingLeft: 2 }}>Value</Box>
        </Box>
      </EditorToolbar>
      <ReorderableList
        aria-disabled={disabled}
        classes={{
          root: 'overflow-y pt-0',
        }}
        dense
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
              disabled={disabled}
              key={id}
              index={index}
              reorderPreview={reorderPreview}
              resetPreview={resetPreview}
              selected={selectedCommandIndexes.includes(origIndex)}
            />
          )
        })}
      </ReorderableList>
    </>
  )
}

export default CommandList
