import loadingID from 'api/constants/loadingID'
import AppWrapper from 'browser/components/AppWrapper'
import PanelNav from 'browser/components/PanelNav'
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
    <AppWrapper className='no-overflow-y'>
      <PanelNav vertical />
      <TestControls state={state} />
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectPlaybackControls), domContainer)
