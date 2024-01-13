import PauseIcon from '@mui/icons-material/Pause'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'
import baseControlProps from './BaseProps'

const PauseButton: FC = () => (
  <Tooltip title="Pause" aria-label="pause">
    <IconButton
      {...baseControlProps}
      onClick={() => window.sideAPI.playback.pause()}
    >
      <PauseIcon />
    </IconButton>
  </Tooltip>
)

export default PauseButton
