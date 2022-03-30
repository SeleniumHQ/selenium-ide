import Tooltip from '@mui/material/Tooltip'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import { StateShape } from 'api/types'
import React, { FC } from 'react'

export interface PlayListButtonProps {
  state: StateShape
}

const PlayListButton: FC<PlayListButtonProps> = ({ state }) => (
  <Tooltip title="Play Suite" aria-label="play-suite">
    <PlaylistPlayIcon
      className="button m-2"
      onClick={() => window.sideAPI.playback.play(state.activeSuiteID)}
    />
  </Tooltip>
)

export default PlayListButton
