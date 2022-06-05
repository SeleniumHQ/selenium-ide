import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import PauseIcon from '@mui/icons-material/Pause'
import { CommandShape } from '@seleniumhq/side-model'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { camelToTitleCase } from '@seleniumhq/side-api/dist/helpers/string'
import ReorderableListItem from 'browser/components/ReorderableListItem'
import React from 'react'
import { ReorderPreview } from 'browser/hooks/useReorderPreview'
import CommandOverlay from './TestCommandOverlay'

const {
  state: { updateStepSelection },
  tests: { updateStep },
} = window.sideAPI

type ColorMode = 'light' | 'dark'

export const colorFromCommandState = (
  state: PlaybackEventShapes['COMMAND_STATE_CHANGED']['state'] | undefined,
  mode: ColorMode
) => {
  switch (state) {
    case 'skipped':
    case 'undetermined':
      return `warning.${mode}`
    case 'executing':
      return `info.${mode}`
    case 'pending':
      return `secondary.${mode}`
    case 'errored':
    case 'failed':
      return `error.${mode}`
    case 'passed':
      return `success.${mode}`
    default:
      return 'transparent'
  }
}

const commandIndexTextFormat = { color: 'primary.main' }

const commandTextFormat = { color: 'primary.main', typography: 'body2' }
const commentTextFormat = {
  color: 'info.main',
  typography: 'subtitle2',
}
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
  command: { command, comment, id, isBreakpoint, target, value },
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
  if (commandState.state === 'executing') {
    window.scrollTo(0, 20 * index)
  }
  const isDisabled = command.startsWith('//')
  const commandText = isDisabled ? command.slice(2) : command
  const mainClass = ['pos-rel'].concat(isDisabled ? ['o-50'] : []).join(' ')
  return (
    <ReorderableListItem
      className={mainClass}
      componentsProps={{
        root: {
          style: {
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
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
      disablePadding
      reorder={(_, newIndex) => reorderPreview({ newIndex })}
      reorderConfirm={(_, newIndex) =>
        window.sideAPI.tests.reorderSteps(activeTest, newIndex)
      }
      reorderReset={resetPreview}
      selected={selected}
      select={updateStepSelection}
      secondaryAction={
        <IconButton
          color={isBreakpoint ? 'primary' : 'default'}
          onClick={toggleBreakpoint}
        >
          <PauseIcon />
        </IconButton>
      }
      sx={{
        width: '100%',
      }}
    >
      {comment && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            textAlign: 'flex-start',
            width: 'inherit',
          }}
        >
          <Box sx={{ flex: 0, flexBasis: 50, textAlign: 'center' }}>&nbsp;</Box>
          <Box
            sx={{
              flex: 1,
              opacity: 0.75,
              width: 'inherit',
              ...commentTextFormat,
            }}
          >
            // {comment}
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          paddingTop: comment ? 0 : 0.5,
          paddingBottom: commandState.message ? 0 : 0.5,
          textAlign: 'flex-start',
          width: 'inherit',
        }}
      >
        <Box
          sx={{
            flex: 0,
            flexBasis: 50,
            textAlign: 'center',
            ...commandIndexTextFormat,
          }}
        >
          {index + 1}
        </Box>
        <Box sx={{ paddingLeft: 1, flex: 1, ...commandTextFormat }}>
          {camelToTitleCase(commandText)} {isDisabled ? '[Disabled]' : ''}
        </Box>
        <Box sx={{ flex: 2, ...argTextFormat }}>{target}</Box>
        <Box sx={{ flex: 2, ...argTextFormat }}>{value}</Box>
        <Box sx={{ flex: 0, flexBasis: 50 }}></Box>
      </Box>
      {commandState.message && (
        <Box sx={errorTextFormat}>
          <Typography>{commandState.message}</Typography>
        </Box>
      )}
      <CommandOverlay state={commandState.state ?? null} />
      <Box />
    </ReorderableListItem>
  )
}

export default CommandRow
