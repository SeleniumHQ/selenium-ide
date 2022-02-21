import loadingID from 'api/constants/loadingID'
import AppPanelWrapper from 'browser/components/AppPanelWrapper'
import { getActiveCommand, getActiveTest } from 'browser/helpers/getActiveData'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import ReactDOM from 'react-dom'
import CommandEditor from './components/CommandEditor'
import CommandList from './components/CommandList'

const ProjectTestCommandList = () => {
  const session = subscribeToSession()
  const activeTest = getActiveTest(session)
  const activeCommand = getActiveCommand(session)
  const {
    project: { id },
    state: { activeCommandID, activeTestID, commands, playback },
  } = session
  if (id == loadingID) {
    return null
  }
  return (
    <AppPanelWrapper>
      <CommandList
        activeCommand={activeCommandID}
        activeTest={activeTestID}
        commands={activeTest.commands}
        commandStates={playback.commands}
      />
      <CommandEditor
        commands={commands}
        command={activeCommand}
        testID={activeTestID}
      />
    </AppPanelWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectTestCommandList), domContainer)
