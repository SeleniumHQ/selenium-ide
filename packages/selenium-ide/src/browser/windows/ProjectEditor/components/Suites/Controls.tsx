import Tooltip from '@mui/material/Tooltip'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import PauseIcon from '@mui/icons-material/Pause'
import StopIcon from '@mui/icons-material/Stop'
import { StateShape } from 'api/types'
import React, { FC } from 'react'

export interface SuiteControlsProps {
  state: StateShape
}

const activeStates = ['recording', 'playing']

const SuiteControls: FC<SuiteControlsProps> = ({ state }) => (
  <>
    {activeStates.includes(state.status) ? (
      <>
        <Tooltip title="Pause" aria-label="pause">
          <PauseIcon
            className="button m-2"
            onClick={() => window.sideAPI.playback.pause()}
          />
        </Tooltip>
        <Tooltip title="Stop" aria-label="stop">
          <StopIcon
            className="button m-2"
            onClick={() => window.sideAPI.playback.stop()}
          />
        </Tooltip>
      </>
    ) : (
      <>
        <Tooltip title="Play Suite" aria-label="play-suite">
          <PlaylistPlayIcon
            className="button m-2"
            onClick={() => window.sideAPI.playback.play(state.activeSuiteID)}
          />
        </Tooltip>
      </>
    )}
  </>
)

export default SuiteControls
