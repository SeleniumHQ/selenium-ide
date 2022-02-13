import React from 'react'
import ReactDOM from 'react-dom'
import loadingID from 'api/constants/loadingID'
import AppWrapper from 'browser/components/AppWrapper'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import CommandEditor from './components/CommandEditor'
import { getActiveCommand, getActiveTest } from 'browser/helpers/getActiveData'

const ProjectCommandEditor = () => {
  const session = subscribeToSession()
  const { project: { id }, state: { commands }} = session;
  const activeTest = getActiveTest(session);
  const activeCommand = getActiveCommand(session);

  if (id == loadingID) {
    return <div className="flex-col w-full">Loading</div>
  }

  return (
    <AppWrapper>
      <CommandEditor
        commands={commands}
        command={activeCommand}
        testID={activeTest.id}
      />
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectCommandEditor), domContainer)
