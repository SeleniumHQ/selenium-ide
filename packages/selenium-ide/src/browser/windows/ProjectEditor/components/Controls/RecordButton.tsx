import RecordIcon from '@mui/icons-material/FiberManualRecord'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'
import baseControlProps from './BaseProps'

const RecordButton: FC = () => (
  <Tooltip title="Record" aria-label="record">
    <IconButton
      {...baseControlProps}
      onClick={() => window.sideAPI.recorder.start()}
    >
      <RecordIcon color="error" />
    </IconButton>
  </Tooltip>
)

export default RecordButton
