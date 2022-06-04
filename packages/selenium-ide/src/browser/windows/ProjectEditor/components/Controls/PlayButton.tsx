import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { StateShape } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import { badIndex } from '@seleniumhq/side-api/dist/constants/badIndex'
import baseControlProps from './BaseProps'

export interface PlayButtonProps {
  state: StateShape
}

const PlayButton: FC<PlayButtonProps> = ({ state }) => (
  <Tooltip title="Play" aria-label="play">
    <IconButton
      {...baseControlProps}
      onClick={() => {
        state.playback.currentIndex === badIndex
          ? window.sideAPI.playback.play(state.activeTestID)
          : window.sideAPI.playback.resume()
      }}
    >
      <PlayArrowIcon />
    </IconButton>
  </Tooltip>
)

export default PlayButton
