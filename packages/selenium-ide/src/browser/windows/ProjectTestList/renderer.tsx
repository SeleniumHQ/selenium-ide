import React from 'react'
import ReactDOM from 'react-dom'
import AppWrapper from 'browser/components/AppWrapper'
import loadingID from '../../../api/constants/loadingID'
import TestList from './components/TestList'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import PanelNav from 'browser/components/PanelNav'

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
