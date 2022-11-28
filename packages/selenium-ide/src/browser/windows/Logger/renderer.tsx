import React from 'react'
import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import SIDELogger from './components/Logger'

const ProjectPlaybackControls = () =>(
  <AppWrapper>
    <SIDELogger />
  </AppWrapper>
)

renderWhenReady(ProjectPlaybackControls)
