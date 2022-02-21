import loadingID from 'api/constants/loadingID'
import AppPanelWrapper from 'browser/components/AppPanelWrapper'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import ReactDOM from 'react-dom'
import TestControls from './components/TestControls'

const ProjectPlaybackControls = () => {
  const session = subscribeToSession()
  const { project, state } = session
  if (project.id == loadingID) {
    return null
  }

  return (
    <AppPanelWrapper horizontal>
      <TestControls state={state} />
    </AppPanelWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectPlaybackControls), domContainer)
