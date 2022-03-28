import Tooltip from '@mui/material/Tooltip'
import PauseIcon from '@mui/icons-material/Pause'
import React, { FC } from 'react'

const PauseButton: FC = () => (
  <Tooltip title="Pause" aria-label="pause">
    <PauseIcon
      className="button m-2"
      onClick={() => window.sideAPI.playback.pause()}
    />
  </Tooltip>
)

export default PauseButton
