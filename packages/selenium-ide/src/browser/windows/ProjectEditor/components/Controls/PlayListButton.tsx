import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { StateShape } from 'api/types'
import React, { FC } from 'react'

export interface PlayListButtonProps {
  state: StateShape
}

const PlayListButton: FC<PlayListButtonProps> = () => (
  <Tooltip title="Play Suite" aria-label="play-suite">
    <IconButton
      className="m-2 not-draggable"
      color="inherit"
      onClick={() => window.sideAPI.playback.playSuite()}
    >
      <PlaylistPlayIcon />
    </IconButton>
  </Tooltip>
)

export default PlayListButton
