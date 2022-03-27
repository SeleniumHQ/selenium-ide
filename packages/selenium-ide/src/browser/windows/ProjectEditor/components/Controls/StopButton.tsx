import Tooltip from '@mui/material/Tooltip'
import StopIcon from '@mui/icons-material/Stop'
import React, { FC } from 'react'

const StopButton: FC = () => (
  <Tooltip title="Stop" aria-label="stop">
    <StopIcon
      className="button m-2"
      onClick={() => window.sideAPI.playback.stop()}
    />
  </Tooltip>
)

export default StopButton
