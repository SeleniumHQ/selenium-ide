import Clear from '@mui/icons-material/Clear'
import { useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import React from 'react'

const {
  windows: { closePlaybackWindow, focusPlaybackWindow },
} = window.sideAPI

export type TabShape = {
  id: number
  focused: boolean
  test: string
  title: string
  url: string
  visible: boolean
}

const playbackTabSX = { borderRadius: 0.5 }

const PlaybackTab: React.FC<TabShape> = ({
  focused,
  id,
  test,
  title,
  visible,
}) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const colorSuffix = `.${prefersDarkMode ? 'dark' : 'light'}`
  return (
    <Paper
      className="flex flex-1 flex-row mw-200 no-window-drag ps-3 text-overflow z-2"
      elevation={1}
      onClick={() => {
        focusPlaybackWindow(id)
      }}
      square
      sx={{
        backgroundColor: `${visible ? 'warning' : 'info'}${colorSuffix}`,
        opacity: visible ? (focused ? 1 : 0.9) : 0.7,
        borderRadius: '12px 12px 0 0',
        marginLeft: '1px',
      }}
    >
      <Box
        className="flex flex-1 flex-col height-100 text-overflow"
        justifyContent="center"
      >
        <Typography variant="subtitle1">{test || title}</Typography>
      </Box>
      <Box className="flex flex-initial">
        <IconButton
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            closePlaybackWindow(id)
          }}
          size="small"
          sx={playbackTabSX}
        >
          <Clear />
        </IconButton>
      </Box>
    </Paper>
  )
}

export default PlaybackTab
