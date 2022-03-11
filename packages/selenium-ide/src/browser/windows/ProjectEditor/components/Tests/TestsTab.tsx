import Paper from '@mui/material/Paper'
import { getActiveCommand, getActiveTest } from 'browser/helpers/getActiveData'
import React, { useEffect } from 'react'
import CommandEditor from './TestCommandEditor'
import CommandList from './TestCommandList'
import { CoreSessionData } from 'api/types'
import DrawerHeader from '../Drawer/Header'
import { drawerWidth } from '../Drawer'

const TestsTab: React.FC<{
  open: boolean
  session: CoreSessionData
}> = ({ open, session }) => {
  const activeTest = getActiveTest(session)
  const activeCommand = getActiveCommand(session)
  const {
    state: { activeCommandID, activeTestID, commands, playback },
  } = session

  const [bottomOffset, setBottomOffset] = React.useState(0)
  useEffect(() => {
    const commandEditorHeight =
      document.getElementById('command-editor')?.clientHeight ?? 0
    setBottomOffset(commandEditorHeight + 10)
  }, [activeCommand.id])
  return (
    <>
      <DrawerHeader />
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
          left: open ? drawerWidth : 0,
          right: 0,
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
