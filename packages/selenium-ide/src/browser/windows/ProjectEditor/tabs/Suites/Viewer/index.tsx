import List from '@mui/material/List'
import { CoreSessionData } from '@seleniumhq/side-api'
import EditorToolbar from '../../../components/Drawer/EditorToolbar'
import React, { FC } from 'react'
import SuiteViewerEntry from './Entry'

export interface CurrentSuiteTestListProps {
  session: CoreSessionData
}

const SuiteViewer: FC<CurrentSuiteTestListProps> = ({ session }) => {
  const tests = session.project.tests
  const testResults = session.state.playback.testResults
  const commandResults = session.state.playback.commands
  return (
    <>
      <EditorToolbar
        onEdit={() => window.sideAPI.state.toggleSuiteMode('editor')}
      >
        <span className="ml-4">Suite Player</span>
      </EditorToolbar>
      <List dense>
        {tests.map((test) => {
          const lastCommand = testResults[test.id]?.lastCommand
          const command = lastCommand
            ? test.commands.find((t) => t.id === lastCommand) || null
            : null
          const result = lastCommand
            ? commandResults[lastCommand] ?? null
            : null
          return (
            <SuiteViewerEntry
              key={test.id}
              command={command}
              result={result}
              test={test}
            />
          )
        })}
      </List>
    </>
  )
}

export default SuiteViewer
