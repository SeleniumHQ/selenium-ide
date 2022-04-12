import PauseIcon from '@mui/icons-material/Pause'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'

const PauseButton: FC = () => (
  <Tooltip title="Pause" aria-label="pause">
    <IconButton
      className="m-2 not-draggable"
      color="inherit"
      onClick={() => window.sideAPI.playback.pause()}
    >
      <PauseIcon />
    </IconButton>
  </Tooltip>
)

export default PauseButton
