import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { LoadedWindow } from 'browser/types'
import Grid from '@material-ui/core/Grid'
import AppWrapper from 'browser/components/AppWrapper'
import { useImmer } from 'use-immer'
import defaultProject from 'api/models/project'
import defaultTest from 'api/models/project/test'
import defaultCommand from 'api/models/project/command'
import defaultState from 'api/models/state'
import { CommandShape, CoreSessionData, TestShape } from 'api/types'
import loadingID from '../../../api/constants/loadingID'
import TestControls from './components/TestControls'
import TestList from './components/TestList'
import CommandList from './components/CommandList'
import CommandEditor from './components/CommandEditor'

const { sideAPI } = window as LoadedWindow

const hasID =
  (id2: string) =>
  ({ id }: { id: string }) =>
    id2 === id

const ProjectEditor = () => {
  const [session, updateSession] = useImmer<CoreSessionData>({
    project: defaultProject,
    state: defaultState,
  })
  const { project } = session

  useEffect(() => {
    Promise.all([sideAPI.commands.get(), sideAPI.projects.getActive()]).then(
      ([commandTypes, project]) => {
        updateSession((session) => {
          session.state.commands = commandTypes
          session.project = project
          session.state.activeTest = project.tests[0].id
          session.state.activeCommand = project.tests[0].commands[0].id
        })
      }
    )
  }, [])

  const activeTestID = session.state.activeTest
  const activeTest = useMemo(
    () => project.tests.find(hasID(activeTestID)) || defaultTest,
    [activeTestID, project]
  ) as TestShape

  const activeCommandID = session.state.activeCommand
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
          <TestList
            activeTest={activeTestID}
            tests={project.tests}
            setActiveTest={sideAPI.state.setActiveTest}
          />
        </Grid>
        <Grid className="height-100" item xs={9}>
          <div className="flex flex-col height-100">
            <TestControls test={activeTest} />
            <CommandList
              activeCommand={activeCommandID}
              setActiveCommand={sideAPI.state.setActiveCommand}
              commands={activeTest.commands}
            />
            <CommandEditor command={activeCommand} testID={activeTestID} />
          </div>
        </Grid>
      </Grid>
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectEditor), domContainer)
