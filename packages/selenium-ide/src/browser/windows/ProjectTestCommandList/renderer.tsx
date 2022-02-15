import loadingID from 'api/constants/loadingID'
import AppWrapper from 'browser/components/AppWrapper'
import PanelNav from 'browser/components/PanelNav'
import { getActiveTest } from 'browser/helpers/getActiveData'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import ReactDOM from 'react-dom'
import CommandList from './components/CommandList'

const ProjectTestCommandList = () => {
  const session = subscribeToSession()
  const activeTest = getActiveTest(session)

  const {
    project: { id },
    state: { activeCommandID, playback },
  } = session
  if (id == loadingID) {
    return null
  }

  return (
    <AppWrapper>
      <PanelNav />
      <CommandList
        activeCommand={activeCommandID}
        commands={activeTest.commands}
        commandStates={playback.commands}
      />
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectTestCommandList), domContainer)
