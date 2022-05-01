import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { StateShape } from 'api/types'
import React, { FC } from 'react'
import baseControlProps from './BaseProps'

export interface PlayListButtonProps {
  state: StateShape
}

const PlayListButton: FC<PlayListButtonProps> = () => (
  <Tooltip title="Play Suite" aria-label="play-suite">
    <IconButton
      {...baseControlProps}
      onClick={() => window.sideAPI.playback.playSuite()}
    >
      <PlaylistPlayIcon />
    </IconButton>
  </Tooltip>
)

export default PlayListButton
