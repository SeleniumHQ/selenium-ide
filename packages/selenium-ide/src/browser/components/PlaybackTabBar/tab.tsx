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
  title: string
  focused: boolean
}

const PlaybackTab: React.FC<TabShape> = ({ focused, id, title }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const colorSuffix = `.${prefersDarkMode ? 'dark' : 'light'}`
  return (
    <Paper
      className="flex flex-1 flex-row mw-200 mx-2 ps-3 text-overflow z-2"
      elevation={1}
      onClick={() => {
        focusPlaybackWindow(id)
      }}
      square
      sx={{
        backgroundColor: `${focused ? 'success' : 'info'}${colorSuffix}`,
      }}
    >
      <Box
        className="flex flex-1 flex-col height-100 text-overflow"
        justifyContent="center"
      >
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      <Box className="flex flex-initial">
        <IconButton
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            closePlaybackWindow(id)
          }}
          sx={{ borderRadius: 0.5 }}
        >
          <Clear />
        </IconButton>
      </Box>
    </Paper>
  )
}

export default PlaybackTab
