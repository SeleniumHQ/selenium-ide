import List from '@mui/material/List'
import { CoreSessionData } from '@seleniumhq/side-api'
import EditorToolbar from '../../../components/Drawer/EditorToolbar'
import React, { FC } from 'react'
import SuiteViewerEntry from './Entry'

export interface CurrentSuiteTestListProps {
  session: CoreSessionData
  setIsEditing: (isEditing: boolean) => void
}

const SuiteViewer: FC<CurrentSuiteTestListProps> = ({
  session,
  setIsEditing,
}) => {
  const tests = session.project.tests
  const testResults = session.state.playback.testResults
  const commandResults = session.state.playback.commands
  return (
    <List dense>
      <EditorToolbar onEdit={() => setIsEditing(true)}>
        Suite Player
      </EditorToolbar>
      {tests.map((test) => {
        const lastCommand = testResults[test.id]?.lastCommand
        const command = lastCommand
          ? test.commands.find((t) => t.id === lastCommand) || null
          : null
        const result = lastCommand ? commandResults[lastCommand] ?? null : null
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
  )
}

export default SuiteViewer
