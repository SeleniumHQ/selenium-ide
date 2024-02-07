import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { loadingID } from '@seleniumhq/side-api/dist/constants/loadingID'
import { getActiveSuite } from '@seleniumhq/side-api/dist/helpers/getActiveData'
import { TestShape } from '@seleniumhq/side-model'
import { SIDEMainProps } from 'browser/components/types'
import React from 'react'
import SuiteEditor from './SuiteEditor'
import AvailableSuiteTestList from './AvailableSuiteTestList'
import CurrentSuiteTestList from './CurrentSuiteTestList'

const SuiteCustomizer: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => {
  const activeSuite = getActiveSuite(session)
  const activeTests = activeSuite.tests.map(
    (id) => session.project.tests.find((t) => t.id === id) as TestShape
  )
  const {
    project: { tests },
    state: { activeSuiteID, editor },
  } = session
  if (activeSuite.id === loadingID) {
    return (
      <Box className="flex-1 width-100" textAlign="center">
        <Typography className="p-4">No Suite Selected</Typography>
      </Box>
    )
  }
  return (
    <>
      <Box className="flex-1 flex-row no-overflow-y">
        <CurrentSuiteTestList
          activeSuite={activeSuiteID}
          selectedIndexes={editor.selectedTestIndexes}
          tests={activeTests}
        />
        <AvailableSuiteTestList activeSuite={activeSuiteID} allTests={tests} />
      </Box>
      <Paper className="flex-initial" elevation={1} id="suite-editor" square>
        <SuiteEditor suite={activeSuite} />
      </Paper>
    </>
  )
}

export default SuiteCustomizer
