import Paper from '@mui/material/Paper'
import { getActiveSuite } from 'api/helpers/getActiveData'
import React from 'react'
import SuiteEditor from './SuiteEditor'
import SuiteTestList from './SuiteTestList'
import { CoreSessionData } from 'api/types'
import DrawerHeader from '../Drawer/Header'
import { useHeightFromElement } from 'browser/helpers/useHeightFromElement'

const SuitesTab: React.FC<{
  session: CoreSessionData
}> = ({ session }) => {
  const activeSuite = getActiveSuite(session)
  const {
    project: { tests },
    state: { activeSuiteID },
  } = session

  const bottomOffset = useHeightFromElement('suite-editor')
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
          left: 0,
          right: 0,
          zIndex: 2000,
        }}
      >
        <SuiteEditor suite={activeSuite} />
      </Paper>
    </>
  )
}

export default SuitesTab
