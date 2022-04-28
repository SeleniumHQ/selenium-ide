import { Box, Chip, IconButton, ListItemText, TableCell, TableRow, useMediaQuery } from '@mui/material'
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
          color={isBreakpoint ? 'success' : 'default'}
          edge="end"
          onClick={toggleBreakpoint}
        >
          <PauseIcon />
        </IconButton>
      }
      selected={selected}
      select={updateStepSelection}
    >
      <TableRow style={{ borderBottomStyle: 'none' }}>
        <TableCell style={{ borderBottomStyle: 'none', bottom: 'none' }}>
          <Chip label={index + 1}></Chip>
        </TableCell>
        <TableCell style={{ borderBottomStyle: 'none', bottom: 'none' }}>
          <ListItemText
            disableTypography
            primary={
              <TableCell
                style={{
                  borderBottomStyle: 'none',
                  paddingLeft: 10,
                  bottom: 'none',
                  borderBottom: 'none',
                }}
                sx={commandTextFormat}
              >
                {camelToTitleCase(commandText)} {isDisabled ? '[Disabled]' : ''}
              </TableCell>
            }
            secondary={
              <>
                <TableCell
                  style={{
                    borderBottomStyle: 'none',
                    paddingLeft: 10,
                    bottom: 'none',
                    borderBottom: 'none',
                  }}
                  sx={argTextFormat}
                >
                  {target}
                </TableCell>
                <TableCell
                  style={{
                    borderBottom: 'none',
                    borderBottomStyle: 'none',
                    paddingLeft: 10,
                  }}
                  sx={argTextFormat}
                >
                  {value}
                </TableCell>
                <TableCell
                  sx={errorTextFormat}
                  style={{
                    borderBottom: 'none',
                    borderBottomStyle: 'none',
                  }}
                >
                  {commandState.message}
                </TableCell>
              </>
            }
          />
        </TableCell>
      </TableRow>
      <Box
        className="fill pos-abs o-25"
        sx={{ bgcolor, marginLeft: -2, pointerEvents: 'none', zIndex: 75 }}
      />
    </ReorderableListItem>
  )
}

export default CommandRow
