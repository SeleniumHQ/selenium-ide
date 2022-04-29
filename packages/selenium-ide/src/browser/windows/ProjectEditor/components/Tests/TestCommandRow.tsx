import { Box, IconButton, Typography, useMediaQuery } from '@mui/material'
import PauseIcon from '@mui/icons-material/Pause'
import { CommandShape } from '@seleniumhq/side-model'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { camelToTitleCase } from 'api/helpers/string'
import ReorderableListItem from 'browser/components/ReorderableListItem'
import React from 'react'
import { ReorderPreview } from 'browser/hooks/useReorderPreview'

const {
  state: { updateStepSelection },
  tests: { updateStep },
} = window.sideAPI

type ColorMode = 'light' | 'dark'

const colorFromCommandState = (
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
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    ? 'dark'
    : 'light'
  const toggleBreakpoint = () =>
    updateIsBreakpoint(activeTest, id, !isBreakpoint)
  const bgcolor = colorFromCommandState(commandState.state, prefersDarkMode)
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
          color={isBreakpoint ? 'success' : 'default'}
          onClick={toggleBreakpoint}
        >
          <PauseIcon />
        </IconButton>
      }
      sx={{
        paddingTop: comment ? 0 : 2,
        paddingBottom: commandState.message ? 0 : 2,
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
            <Typography>// {comment}</Typography>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          textAlign: 'flex-start',
          width: 'inherit',
        }}
      >
        <Box sx={{ flex: 0, flexBasis: 50, textAlign: 'center' }}>
          <Typography>{index + 1}</Typography>
        </Box>
        <Box sx={{ flex: 1, ...commandTextFormat }}>
          <Typography>
            {camelToTitleCase(commandText)} {isDisabled ? '[Disabled]' : ''}
          </Typography>
        </Box>
        <Box sx={{ flex: 2, ...argTextFormat }}>
          <Typography>{target}</Typography>
        </Box>
        <Box sx={{ flex: 2, ...argTextFormat }}>
          <Typography>{value}</Typography>
        </Box>
        <Box sx={{ flex: 0, flexBasis: 50 }}></Box>
      </Box>
      {commandState.message && (
        <Box sx={errorTextFormat}>
          <Typography>{commandState.message}</Typography>
        </Box>
      )}
      <Box
        className="fill pos-abs o-25"
        sx={{ bgcolor, marginTop: -2, pointerEvents: 'none', zIndex: 75 }}
      />
      <Box />
    </ReorderableListItem>
  )
}

export default CommandRow
