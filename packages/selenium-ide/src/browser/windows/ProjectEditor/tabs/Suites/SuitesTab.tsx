import Box from '@mui/material/Box'
import React, { useContext } from 'react'
import SuiteEditor from './Editor'
import SuiteViewer from './Viewer'
import SuiteSelector from './SuiteSelector'
import { context } from 'browser/contexts/session'

const SuitesTab: React.FC = () => {
  const session = useContext(context)
  const Component =
    session.state.editor.suiteMode === 'editor' ? SuiteEditor : SuiteViewer

  return (
    <Box className="fill flex flex-col">
      {!session.state.editor.showDrawer && <SuiteSelector session={session} />}
      <Component session={session} />
    </Box>
  )
}

export default SuitesTab
