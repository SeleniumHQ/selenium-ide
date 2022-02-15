import loadingID from 'api/constants/loadingID'
import AppWrapper from 'browser/components/AppWrapper'
import PanelNav from 'browser/components/PanelNav'
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
    <AppWrapper>
      <PanelNav />
      <TestList activeTest={activeTestID} tests={project.tests} />
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectTestList), domContainer)
