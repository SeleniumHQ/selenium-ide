import Tooltip from '@mui/material/Tooltip'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { StateShape } from 'api/types'
import React, { FC } from 'react'
import badIndex from 'api/constants/badIndex'

export interface PlayButtonProps {
  state: StateShape
}

const PlayButton: FC<PlayButtonProps> = ({ state }) => (
  <Tooltip title="Play" aria-label="play">
    <PlayArrowIcon
      className="button m-2 not-draggable"
      onClick={() => {
        state.playback.currentIndex === badIndex
          ? window.sideAPI.playback.play(state.activeTestID)
          : window.sideAPI.playback.resume()
      }}
    />
  </Tooltip>
)

export default PlayButton
