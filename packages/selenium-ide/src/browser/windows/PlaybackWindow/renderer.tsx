import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import React from 'react'
import ReactDOM from 'react-dom'
import AppWrapper from 'browser/components/AppWrapper'

const ProjectPlaybackControls = () => (
  <AppWrapper>
    <Paper className="playback-text width-100">
      <Typography align="center" variant="subtitle1">
        This is where recording and playback will occur
      </Typography>
    </Paper>
  </AppWrapper>
)

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectPlaybackControls), domContainer)
