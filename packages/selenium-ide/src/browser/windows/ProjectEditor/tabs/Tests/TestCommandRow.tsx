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
  disabled?: boolean
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
  commandState,
  command: { command, comment, id, isBreakpoint, target, value },
  disabled = false,
  index,
  reorderPreview,
  resetPreview,
  selected,
}) => {
  if (typeof command != 'string') {
    command = '//unknown - could not process'
  }
  const state = commandState?.state ?? null
  const toggleBreakpoint = () =>
    updateIsBreakpoint(activeTest, id, !isBreakpoint)
  if (state === 'executing') {
    window.scrollTo(0, 20 * index)
  }
  const isDisabled = command.startsWith('//')
  const commandText = isDisabled ? command.slice(2) : command
  const mainClass = ['pos-rel width-100']
    .concat(isDisabled ? ['o-50'] : [])
    .join(' ')
  const message = commandState?.message ?? ''
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
      data-command={commandText}
      data-command-id={id}
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
          color={isBreakpoint ? 'warning' : 'default'}
          disabled={disabled}
          onClick={toggleBreakpoint}
        >
          <PauseIcon />
        </IconButton>
      }
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
        className="flex flex-row"
        sx={{
          paddingTop: comment ? 0 : 0.5,
          paddingBottom: message ? 0 : 0.5,
          textAlign: 'flex-start',
          width: 'inherit',
        }}
      >
        <Box
          className="flex-initial"
          sx={{
            flexBasis: 50,
            justifyContent: 'center',
            ...commandIndexTextFormat,
          }}
        >
          <Typography variant="subtitle1">{index + 1}</Typography>
        </Box>
        <Box className="flex flex-1 no-overflow-x">
          <Box
            className="flex flex-col"
            sx={{ justifyContent: 'center', ...commandTextFormat }}
          >
            <Typography textOverflow="ellipsis" variant="body1">
              {camelToTitleCase(commandText)} {isDisabled ? '[Disabled]' : ''}
            </Typography>
          </Box>
        </Box>
        <Box className="flex no-overflow-x" sx={{ flex: '2 2 1px' }}>
          <Box
            className="flex flex-col"
            sx={{ justifyContent: 'center', ...argTextFormat }}
          >
            <Typography textOverflow="ellipsis" variant="body1">
              {target}
            </Typography>
          </Box>
        </Box>
        <Box className="flex no-overflow-x" sx={{ flex: '2 2 1px' }}>
          <Box
            className="flex flex-col"
            sx={{ justifyContent: 'center', ...argTextFormat }}
          >
            <Typography textOverflow="ellipsis" variant="body1">
              {value}
            </Typography>
          </Box>
        </Box>
        <Box className="flex" sx={{ flex: 0, flexBasis: 74 }}></Box>
      </Box>
      {message && (
        <Box sx={errorTextFormat}>
          <Typography>{message}</Typography>
        </Box>
      )}
      <CommandOverlay state={state} />
      <Box />
    </ReorderableListItem>
  )
}

export default CommandRow
