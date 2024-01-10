import React from 'react'
import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import SIDELogger from './main'

const ProjectPlaybackControls = () =>(
  <AppWrapper>
    <SIDELogger />
  </AppWrapper>
)

renderWhenReady(ProjectPlaybackControls)
