import { CommandShape, TestShape } from '@seleniumhq/side-model'
import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'
import Grid from '@material-ui/core/Grid'
import AppWrapper from 'browser/components/AppWrapper'
import defaultTest from 'api/models/project/test'
import defaultCommand from 'api/models/project/command'
import loadingID from '../../../api/constants/loadingID'
import TestControls from './components/TestControls'
import TestList from './components/TestList'
import CommandList from './components/CommandList'
import CommandEditor from './components/CommandEditor'
import subscribeToSession from 'browser/helpers/subscribeToSession'

const hasID =
  (id2: string) =>
  ({ id }: { id: string }) =>
    id2 === id

const ProjectEditor = () => {
  const session = subscribeToSession()
  const { project, state } = session
  const { activeCommandID, activeTestID, commands } = state

  const activeTest = useMemo(
    () => project.tests.find(hasID(activeTestID)) || defaultTest,
    [activeTestID, project]
  ) as TestShape

  const activeCommand = useMemo(
    () => activeTest.commands.find(hasID(activeCommandID)) || defaultCommand,
    [activeCommandID, activeTest]
  ) as CommandShape

  if (project.id == loadingID) {
    return <div className="flex-col w-full">Loading project</div>
  }

  return (
    <AppWrapper>
      <Grid className="fill" container spacing={0}>
        <Grid className="height-100" item xs={3}>
          <TestList activeTest={activeTestID} tests={project.tests} />
        </Grid>
        <Grid className="height-100" item xs={9}>
          <div className="flex flex-col height-100">
            <TestControls state={state} />
            <CommandList
              activeCommand={activeCommandID}
              commands={activeTest.commands}
            />
            <CommandEditor
              commands={commands}
              command={activeCommand}
              testID={activeTestID}
            />
          </div>
        </Grid>
      </Grid>
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectEditor), domContainer)
