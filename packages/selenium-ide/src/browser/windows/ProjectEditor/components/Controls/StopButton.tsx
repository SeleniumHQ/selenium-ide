import StopIcon from '@mui/icons-material/Stop'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'
import baseControlProps from './BaseProps'

const StopButton: FC = () => (
  <Tooltip title="Stop" aria-label="stop">
    <IconButton
      {...baseControlProps}
      onClick={() => window.sideAPI.playback.stop()}
    >
      <StopIcon />
    </IconButton>
  </Tooltip>
)

export default StopButton
