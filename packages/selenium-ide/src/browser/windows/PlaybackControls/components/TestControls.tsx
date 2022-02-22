import Tooltip from '@material-ui/core/Tooltip'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import RecordIcon from '@material-ui/icons/FiberManualRecord'
import { StateShape } from 'api/types'
import sideAPI from 'browser/helpers/getSideAPI'
import React, { FC } from 'react'
import badIndex from 'api/constants/badIndex'

export interface TestControlsProps {
  state: StateShape
}

const activeStates = ['recording', 'playing']

const TestControls: FC<TestControlsProps> = ({ state }) => (
  <>
    {activeStates.includes(state.status) ? (
      <>
        <Tooltip title="Pause" aria-label="pause">
          <PauseIcon
            className="button m-2"
            onClick={() => sideAPI.playback.pause()}
          />
        </Tooltip>
        <Tooltip title="Stop" aria-label="stop">
          <StopIcon
            className="button m-2"
            onClick={() => sideAPI.playback.stop()}
          />
        </Tooltip>
      </>
    ) : (
      <>
        <Tooltip title="Play" aria-label="play">
          <PlayArrowIcon
            className="button m-2"
            onClick={() => {
              state.playback.currentIndex === badIndex
                ? sideAPI.playback.play(state.activeTestID)
                : sideAPI.playback.resume()
            }}
          />
        </Tooltip>
        <Tooltip title="Play Suite" aria-label="play-suite">
          <PlaylistPlayIcon
            className="button m-2"
            onClick={() => sideAPI.playback.play(state.activeTestID)}
          />
        </Tooltip>
        <Tooltip title="Record" aria-label="record">
          <RecordIcon
            className="button m-2"
            color="error"
            onClick={() => sideAPI.recorder.start(state.activeTestID)}
          />
        </Tooltip>
      </>
    )}
  </>
)

export default TestControls
