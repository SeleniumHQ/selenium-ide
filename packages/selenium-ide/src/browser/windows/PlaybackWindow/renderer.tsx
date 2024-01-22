import AppWrapper from 'browser/components/AppWrapper'
import ProjectPlaybackWindow from 'browser/components/PlaybackPanel'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import React from 'react'

const PlaybackWindowLanding = () => (
  <AppWrapper>
    <ProjectPlaybackWindow />
  </AppWrapper>
)

renderWhenReady(PlaybackWindowLanding)
