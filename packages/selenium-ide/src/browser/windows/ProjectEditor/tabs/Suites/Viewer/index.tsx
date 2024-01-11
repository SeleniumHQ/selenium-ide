import List from '@mui/material/List'
import { CoreSessionData, getActiveSuite, hasID } from '@seleniumhq/side-api'
import { TestShape } from '@seleniumhq/side-model'
import React from 'react'
import SuiteViewerEntry from './Entry'
import EditorToolbar from '../../../components/Drawer/EditorToolbar'
import { SIDEMainProps } from 'browser/windows/ProjectEditor/components/types'

export interface CurrentSuiteTestListProps {
  session: CoreSessionData
}

const SuiteViewer: React.FC<Pick<SIDEMainProps, 'session'>> = ({ session }) => {
  const tests = session.project.tests
  const testResults = session.state.playback.testResults
  const commandResults = session.state.playback.commands
  const activeSuite = getActiveSuite(session)
  return (
    <>
      <EditorToolbar
        elevation={4}
        onEdit={() => window.sideAPI.state.toggleSuiteMode('editor')}
      >
        <span className="ml-4">Suite Player</span>
      </EditorToolbar>
      <List className="overflow-y pt-0" dense>
        {activeSuite.tests.map((testID) => {
          const test = tests.find(hasID(testID)) as TestShape
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
