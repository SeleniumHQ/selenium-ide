import Paper from '@mui/material/Paper'
import { getActiveSuite } from 'api/helpers/getActiveData'
import React, { useEffect } from 'react'
import SuiteEditor from './SuiteEditor'
import SuiteTestList from './SuiteTestList'
import { CoreSessionData } from 'api/types'
import DrawerHeader from '../Drawer/Header'
import { drawerWidth } from '../Drawer'

const SuitesTab: React.FC<{
  open: boolean
  session: CoreSessionData
}> = ({ open, session }) => {
  const activeSuite = getActiveSuite(session)
  const {
    project: { tests },
    state: { activeSuiteID },
  } = session

  const [bottomOffset, setBottomOffset] = React.useState(0)
  useEffect(() => {
    const suiteEditorHeight =
      document.getElementById('suite-editor')?.clientHeight ?? 0
    setBottomOffset(suiteEditorHeight + 10)
  }, [activeSuite.id])
  return (
    <>
      <DrawerHeader />
      <SuiteTestList
        activeSuite={activeSuiteID}
        allTests={tests}
        bottomOffset={bottomOffset}
        tests={activeSuite.tests}
      />
      <Paper
        elevation={1}
        id="suite-editor"
        square
        sx={{
          position: 'fixed',
          bottom: 0,
          left: open ? drawerWidth : 0,
          right: 0,
        }}
      >
        <SuiteEditor suite={activeSuite} />
      </Paper>
    </>
  )
}

export default SuitesTab
