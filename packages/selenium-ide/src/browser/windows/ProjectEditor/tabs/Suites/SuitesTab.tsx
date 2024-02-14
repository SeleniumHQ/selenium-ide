import Box from '@mui/material/Box'
import React from 'react'
import SuiteEditor from './Editor'
import SuiteViewer from './Viewer'
import { SIDEMainProps } from 'browser/components/types'
import SuiteSelector from './SuiteSelector'

const SuitesTab: React.FC<
  Pick<SIDEMainProps, 'session' | 'setTab' | 'tab'>
> = ({ session }) => {
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
