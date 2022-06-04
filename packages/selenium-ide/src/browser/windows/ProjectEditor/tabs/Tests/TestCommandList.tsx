import { CommandShape } from '@seleniumhq/side-model'
import { CommandsStateShape } from '@seleniumhq/side-api'
import ReorderableList from 'browser/components/ReorderableList'
import makeKeyboundNav from 'browser/hooks/useKeyboundNav'
import useReorderPreview from 'browser/hooks/useReorderPreview'
import React, { FC } from 'react'
import CommandListItem from './TestCommandListItem'
import EditorToolbar from '../../components/Drawer/EditorToolbar'

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
          <span className="ml-4">Commands</span>
        </EditorToolbar>
      }
    >
      {preview.map(([command, origIndex], index) => {
        if (!command) {
          return null
        }
        const { id } = command
        return (
          <CommandListItem
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
