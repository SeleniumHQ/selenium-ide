import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import React from 'react'
import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'

const ProjectPlaybackControls = () => (
  <AppWrapper>
    <Paper className="playback-text width-100">
      <Typography align="center" variant="subtitle1">
        This is where recording and playback will occur
      </Typography>
    </Paper>
  </AppWrapper>
)

renderWhenReady(ProjectPlaybackControls)
