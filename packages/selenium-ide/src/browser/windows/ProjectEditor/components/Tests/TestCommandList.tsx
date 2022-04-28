import { CommandShape } from '@seleniumhq/side-model'
import { CommandsStateShape } from 'api/models/state/command'
import useReorderPreview from 'browser/hooks/useReorderPreview'
import React, { FC } from 'react'
import CommandRow from './TestCommandRow'
import EditorToolbar from '../Drawer/EditorToolbar'
import makeKeyboundNav from 'browser/hooks/useKeyboundNav'
import ReorderableList from 'browser/components/ReorderableList'
import {
  Paper,
  Table,
  TableBody,
  TableContainer,
} from '@mui/material'

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
          disableGutters={false}
          sx={{ top: '96px', zIndex: 100 }}
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
          text="Commands"
        />
      }
    >
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table padding="none" stickyHeader aria-label="sticky table">
            <TableBody>
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
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </ReorderableList>
  )
}

export default CommandList
