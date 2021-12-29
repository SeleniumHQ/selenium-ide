import Tooltip from '@material-ui/core/Tooltip'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import RecordIcon from '@material-ui/icons/FiberManualRecord'
import { TestShape } from 'api/types'
import React, { FC } from 'react'

export interface TestControlsProps {
  test: TestShape
}

const TestControls: FC<TestControlsProps> = () => (
  <div className="flex flex-initial flex-row">
    <Tooltip title="Play" aria-label="play">
      <PlayArrowIcon className="button m-2" />
    </Tooltip>
    <Tooltip title="Play Suite" aria-label="play-suite">
      <PlaylistPlayIcon className="button m-2" />
    </Tooltip>
    <Tooltip title="Pause" aria-label="pause">
      <PauseIcon className="button m-2" />
    </Tooltip>
    <Tooltip title="Stop" aria-label="stop">
      <StopIcon className="button m-2" />
    </Tooltip>
    <Tooltip title="Record" aria-label="record">
      <RecordIcon className="button m-2" color="error" />
    </Tooltip>
  </div>
)

export default TestControls
