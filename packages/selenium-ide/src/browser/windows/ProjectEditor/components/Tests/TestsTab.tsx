import Paper from '@mui/material/Paper'
import { getActiveCommand, getActiveTest } from 'api/helpers/getActiveData'
import { useHeightFromElement } from 'browser/helpers/useHeightFromElement'
import React from 'react'
import CommandEditor from './TestCommandEditor'
import CommandList from './TestCommandList'
import { CoreSessionData } from 'api/types'
import MainHeader from '../Main/Header'

const TestsTab: React.FC<{
  session: CoreSessionData
}> = ({ session }) => {
  const activeTest = getActiveTest(session)
  const activeCommand = getActiveCommand(session)
  const {
    state: { activeCommandID, activeTestID, commands, playback },
  } = session

  const bottomOffset = useHeightFromElement('command-editor')
  return (
    <>
      <MainHeader />
      <CommandList
        activeCommand={activeCommandID}
        activeTest={activeTestID}
        bottomOffset={bottomOffset}
        commands={activeTest.commands}
        commandStates={playback.commands}
      />
      <Paper
        elevation={1}
        id="command-editor"
        square
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
        }}
      >
        <CommandEditor
          commands={commands}
          command={activeCommand}
          testID={activeTestID}
        />
      </Paper>
    </>
  )
}

export default TestsTab
