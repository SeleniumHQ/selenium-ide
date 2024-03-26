import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import React from 'react'
// import { useDivMouseObserver } from 'browser/hooks/useMouseExit'
// import noop from 'lodash/fp/noop'

const ProjectPlaybackWindow = () => {
  // const ref = useDivMouseObserver(() => {
  //   if (document.activeElement === document.body) {
  //     window.sideAPI.windows.shiftFocus('playback')
  //   }
  // }, noop)
  return (
    <Box className="fill flex flex-col pos-rel">
      <Box className="flex flex-1 width-100" />
      <Paper className="flex flex-initial p-5 width-100" elevation={0}>
        <Box className="block width-100">
          <Typography align="center" variant="subtitle1">
            This is where recording and playback will occur
          </Typography>
        </Box>
      </Paper>
      <Box className="flex flex-1 width-100" />
    </Box>
  )
}

export default ProjectPlaybackWindow
