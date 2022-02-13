import React from 'react'
import ReactDOM from 'react-dom'
import AppWrapper from 'browser/components/AppWrapper'
import loadingID from '../../../api/constants/loadingID'
import TestControls from './components/TestControls'
import subscribeToSession from 'browser/helpers/subscribeToSession'

const ProjectPlaybackControls = () => {
  const session = subscribeToSession()
  const { project, state } = session
  if (project.id == loadingID) {
    return null
  }

  return (
    <AppWrapper>
      <TestControls state={state} />
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectPlaybackControls), domContainer)
