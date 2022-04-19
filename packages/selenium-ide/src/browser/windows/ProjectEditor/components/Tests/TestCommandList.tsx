import List from '@mui/material/List'
import { CommandShape } from '@seleniumhq/side-model'
import { hasID } from 'api/helpers/hasID'
import { CommandsStateShape } from 'api/models/state/command'
import useReorderPreview from 'browser/hooks/useReorderPreview'
import React, { FC, useEffect } from 'react'
import CommandRow from './TestCommandRow'
import EditorToolbar from '../Drawer/EditorToolbar'

export interface CommandListProps {
  activeCommand: string | null
  activeTest: string
  bottomOffset: number
  commands: CommandShape[]
  commandStates: CommandsStateShape
  selectedCommandIndexes: number[]
}

const traverseKeys: KeyboardEvent['key'][] = ['ArrowUp', 'ArrowDown']

const CommandList: FC<CommandListProps> = ({
  activeCommand,
  activeTest,
  bottomOffset,
  commandStates,
  commands,
  selectedCommandIndexes,
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (traverseKeys.includes(e.key)) {
        let activeCommandIndex = 0
        if (activeCommand) {
          activeCommandIndex = commands.findIndex(hasID(activeCommand))
        }
        const nextCommandIndex =
          e.key === 'ArrowUp' ? activeCommandIndex - 1 : activeCommandIndex + 1
        const nextCommand = commands[nextCommandIndex]
        if (nextCommand) {
          const removeKey = e.altKey
          const anyAddKey = e.shiftKey || e.ctrlKey || e.metaKey
          window.sideAPI.state.updateStepSelection(
            nextCommandIndex,
            e.shiftKey,
            !removeKey && anyAddKey,
            !removeKey && !anyAddKey
          )
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
  const [preview, reorderPreview, resetPreview] = useReorderPreview(
    commands,
    selectedCommandIndexes,
  )
  useEffect(() => {
    resetPreview()
  }, [commands.map((c) => c.id).join('-')])
  return (
    <List
      dense
      subheader={
        <EditorToolbar
          disableGutters={false}
          sx={{ top: '96px', zIndex: 100 }}
          onAdd={() =>
            window.sideAPI.tests.addSteps(
              activeTest,
              Math.max(
                commands.findIndex(({ id }) => id === activeCommand),
                0
              )
            )
          }
          onRemove={
            commands.length > 1
              ? () =>
                  window.sideAPI.tests.removeSteps(activeTest, selectedCommandIndexes)
              : undefined
          }
          text="Commands"
        />
      }
      sx={{
        borderColor: 'primary.main',
        marginBottom: `${bottomOffset}px`,
      }}
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
    </List>
  )
}

export default CommandList
