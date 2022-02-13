import React from 'react'
import ReactDOM from 'react-dom'
import AppWrapper from 'browser/components/AppWrapper'
import loadingID from '../../../api/constants/loadingID'
import CommandList from './components/CommandList'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import { getActiveTest } from 'browser/helpers/getActiveData'

const ProjectTestCommandList = () => {
  const session = subscribeToSession()
  const activeTest = getActiveTest(session);

  const { project: { id }, state: { activeCommandID }} = session;
  if (id == loadingID) {
    return null
  }

  return (
    <AppWrapper>
      <CommandList
        activeCommand={activeCommandID}
        commands={activeTest.commands}
      />
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectTestCommandList), domContainer)
