import Clear from '@mui/icons-material/Clear'
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
  return (
    <Paper
      className="flex flex-1 flex-row mw-200 mx-2 ps-3"
      elevation={10}
      onClick={() => {
        focusPlaybackWindow(id)
      }}
      square
      sx={{
        marginBottom: focused ? 0 : 0.25,
      }}
    >
      <Box className="flex-1 text-overflow">
        <Box className="flex flex-col height-100" justifyContent="center">
          <Typography variant="subtitle1">{title}</Typography>
        </Box>
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
