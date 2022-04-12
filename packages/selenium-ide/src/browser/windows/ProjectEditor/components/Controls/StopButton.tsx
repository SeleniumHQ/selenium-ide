import StopIcon from '@mui/icons-material/Stop'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'

const StopButton: FC = () => (
  <Tooltip title="Stop" aria-label="stop">
    <IconButton
      className="m-2 not-draggable"
      color="inherit"
      onClick={() => window.sideAPI.playback.stop()}
    >
      <StopIcon />
    </IconButton>
  </Tooltip>
)

export default StopButton
