import {
  Box,
  IconButton,
  ListItem,
  ListItemText,
  useMediaQuery,
} from '@material-ui/core'
import PauseIcon from '@material-ui/icons/Pause'
import { CommandShape } from '@seleniumhq/side-model'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import sideAPI from 'browser/helpers/getSideAPI'
import React, { FC } from 'react'

const {
  state: { setActiveCommand },
} = sideAPI

type ColorMode = 'light' | 'dark'

const colorFromCommandState = (
  state: PlaybackEventShapes['COMMAND_STATE_CHANGED']['state'],
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

const camelToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

const commandTextFormat = { color: 'primary.main', typography: 'body2' }
const argTextFormat = {
  color: 'secondary.main',
  typography: 'subtitle2',
  ml: 2,
}

interface CommandRowProps {
  activeTest: string
  commandState: PlaybackEventShapes['COMMAND_STATE_CHANGED']['state']
  command: CommandShape
  index: number
  selected: boolean
}

const updateIsBreakpoint = (
  testID: string,
  commandID: string,
  isBreakpoint: boolean
) => {
  sideAPI.tests.updateStep(testID, commandID, {
    isBreakpoint,
  })
}

const CommandRow: FC<CommandRowProps> = ({
  activeTest,
  commandState,
  command: { command, id, isBreakpoint, target, value },
  selected,
}) => {
  const toggleBreakpoint = () =>
    updateIsBreakpoint(activeTest, id, !isBreakpoint)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    ? 'dark'
    : 'light'
  const bgcolor = colorFromCommandState(commandState, prefersDarkMode)
  return (
    <ListItem
      className="pos-rel"
      divider
      key={id}
      onClick={() => setActiveCommand(id)}
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
    >
      <ListItemText
        disableTypography
        primary={<Box sx={commandTextFormat}>{camelToTitleCase(command)}</Box>}
        secondary={
          <>
            <Box sx={argTextFormat}>{target}</Box>
            <Box sx={argTextFormat}>{value}</Box>
          </>
        }
      />
      <Box
        className="fill pos-abs o-25"
        sx={{ bgcolor, marginLeft: -2, pointerEvents: 'none', zIndex: 75 }}
      />
    </ListItem>
  )
}

export default CommandRow
