import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import React from 'react'

type ColorMode = 'light' | 'dark'

export const colorFromCommandState = (
  state: PlaybackEventShapes['COMMAND_STATE_CHANGED']['state'] | null,
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

interface CommandOverlayProps {
  state: PlaybackEventShapes['COMMAND_STATE_CHANGED']['state'] | null
}

const CommandOverlay: React.FC<CommandOverlayProps> = ({
  state = null,
}) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    ? 'dark'
    : 'light'
  const bgcolor = colorFromCommandState(state, prefersDarkMode)
  return (
    <Box
      className="fill pos-abs o-25"
      sx={{
        bgcolor,
        marginBottom: 1,
        pointerEvents: 'none',
        zIndex: 75,
        top: 0,
        left: 0
      }}
    />
  )
}

export default CommandOverlay
