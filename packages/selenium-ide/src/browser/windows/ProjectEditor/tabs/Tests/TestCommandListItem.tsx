import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import PauseIcon from '@mui/icons-material/Pause'
import { CommandShape } from '@seleniumhq/side-model'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { camelToTitleCase } from '@seleniumhq/side-api/dist/helpers/string'
import ReorderableListItem from 'browser/components/ReorderableListItem'
import { ReorderPreview } from 'browser/hooks/useReorderPreview'
import React from 'react'
import CommandOverlay from './TestCommandOverlay'

const {
  state: { updateStepSelection },
  tests: { updateStep },
} = window.sideAPI

const commandTextFormat = { color: 'primary.main', typography: 'body2' }
const argTextFormat = {
  color: 'secondary.main',
  typography: 'subtitle2',
  ml: 2,
}
const errorTextFormat = {
  color: 'error.main',
  typography: 'caption',
  ml: 2,
}

interface CommandRowProps {
  activeTest: string
  commandState: PlaybackEventShapes['COMMAND_STATE_CHANGED']
  command: CommandShape
  index: number
  reorderPreview: ReorderPreview
  resetPreview: () => void
  selected: boolean
}

const updateIsBreakpoint = (
  testID: string,
  commandID: string,
  isBreakpoint: boolean
) => {
  updateStep(testID, commandID, {
    isBreakpoint,
  })
}

const CommandRow: React.FC<CommandRowProps> = ({
  activeTest,
  commandState = {},
  command: { command, id, isBreakpoint, target, value },
  index,
  reorderPreview,
  resetPreview,
  selected,
}) => {
  if (typeof command != 'string') {
    command = '//unknown - could not process'
  }

  const toggleBreakpoint = () =>
    updateIsBreakpoint(activeTest, id, !isBreakpoint)
  const isDisabled = command.startsWith('//')
  const commandText = isDisabled ? command.slice(2) : command
  const mainClass = ['pos-rel'].concat(isDisabled ? ['o-50'] : []).join(' ')
  return (
    <ReorderableListItem
      className={mainClass}
      divider
      dragType="COMMAND"
      id={id}
      index={index}
      onContextMenu={async () => {
        await updateStepSelection(index, false, true, false)
        await window.sideAPI.menus.open('testEditor', id)
      }}
      onClick={async (e) => {
        const selectBatch = e.shiftKey
        const addEntry = !e.altKey && (e.ctrlKey || e.metaKey || e.shiftKey)
        const clearSelection = !e.altKey && !e.shiftKey && !e.ctrlKey
        await updateStepSelection(index, selectBatch, addEntry, clearSelection)
      }}
      reorder={(_, newIndex) => reorderPreview({ newIndex })}
      reorderConfirm={(_, newIndex) =>
        window.sideAPI.tests.reorderSteps(activeTest, newIndex)
      }
      reorderReset={resetPreview}
      secondaryAction={
        <IconButton
          color={isBreakpoint ? 'primary' : 'default'}
          edge="end"
          onClick={toggleBreakpoint}
        >
          <PauseIcon />
        </IconButton>
      }
      selected={selected}
      select={updateStepSelection}
    >
      <ListItemText
        disableTypography
        primary={
          <Box sx={commandTextFormat}>
            {camelToTitleCase(commandText)} {isDisabled ? '[Disabled]' : ''}
          </Box>
        }
        secondary={
          <>
            <Box sx={argTextFormat}>{target}</Box>
            <Box sx={argTextFormat}>{value}</Box>
            <Box sx={errorTextFormat}>{commandState.message}</Box>
          </>
        }
      />
      <CommandOverlay state={commandState.state ?? null} />
    </ReorderableListItem>
  )
}

export default CommandRow
