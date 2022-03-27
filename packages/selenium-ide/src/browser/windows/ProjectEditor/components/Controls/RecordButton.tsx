import Tooltip from '@mui/material/Tooltip'
import RecordIcon from '@mui/icons-material/FiberManualRecord'
import React, { FC } from 'react'

const RecordButton: FC = () => (
  <Tooltip title="Record" aria-label="record">
    <RecordIcon
      className="button m-2"
      color="error"
      onClick={() => window.sideAPI.recorder.start()}
    />
  </Tooltip>
)

export default RecordButton
