import loadingID from 'api/constants/loadingID'
import AppPanelWrapper from 'browser/components/AppPanelWrapper'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import ReactDOM from 'react-dom'
import TestList from './components/TestList'

const ProjectTestList = () => {
  const session = subscribeToSession()
  const {
    project,
    state: { activeTestID },
  } = session

  if (project.id == loadingID) {
    return null
  }

  return (
    <AppPanelWrapper>
      <TestList activeTest={activeTestID} tests={project.tests} />
    </AppPanelWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectTestList), domContainer)
