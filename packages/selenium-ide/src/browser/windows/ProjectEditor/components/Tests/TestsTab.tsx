import Paper from '@mui/material/Paper'
import { getActiveCommand, getActiveTest } from 'api/helpers/getActiveData'
import { useHeightFromElement } from 'browser/helpers/useHeightFromElement'
import React, { useEffect } from 'react'
import CommandEditor from './TestCommandEditor'
import CommandList from './TestCommandList'
import { CoreSessionData } from 'api/types'
import MainHeader from '../Main/Header'
import loadingID from 'api/constants/loadingID'
import { Typography } from '@mui/material'

const sxCenter = { textAlign: 'center' }
const NoTestFound = () => (
  <>
    <MainHeader />
    <Paper className="p-4" elevation={1} id="command-editor" square>
      <Typography sx={sxCenter}>No Test Selected</Typography>
    </Paper>
  </>
)

const TestsTab: React.FC<{
  session: CoreSessionData
}> = ({ session }) => {
  const {
    state: {
      activeCommandID,
      activeTestID,
      commands,
      editor: { selectedCommands },
      playback,
    },
  } = session

  const bottomOffset = useHeightFromElement('command-editor')
  useEffect(() => {
    window.sideAPI.state.openTestEditor()
    return () => {
      window.sideAPI.state.closeTestEditor()
    }
  }, [])

  if (activeTestID === loadingID) {
    return <NoTestFound />
  }

  const activeTest = getActiveTest(session)
  const activeCommand = getActiveCommand(session)

  return (
    <>
      <MainHeader />
      <CommandList
        activeCommand={activeCommandID}
        activeTest={activeTestID}
        bottomOffset={bottomOffset}
        commands={activeTest.commands}
        commandStates={playback.commands}
        selectedCommands={selectedCommands}
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
          selectedCommands={selectedCommands}
          testID={activeTestID}
        />
      </Paper>
    </>
  )
}

export default TestsTab
