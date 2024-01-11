import Paper from '@mui/material/Paper'
import { getActiveSuite } from '@seleniumhq/side-api/dist/helpers/getActiveData'
import React from 'react'
import SuiteEditor from './SuiteEditor'
import AvailableSuiteTestList from './AvailableSuiteTestList'
import EditorToolbar from '../../../components/Drawer/EditorToolbar'
import { TestShape } from '@seleniumhq/side-model'
import CurrentSuiteTestList from './CurrentSuiteTestList'
import { SIDEMainProps } from 'browser/windows/ProjectEditor/components/types'
import { Box } from '@mui/material'

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

  return (
    <>
      <EditorToolbar
        elevation={4}
        onView={() => window.sideAPI.state.toggleSuiteMode('viewer')}
      >
        <span className="ml-4">Suite Editor</span>
      </EditorToolbar>
      <Box className="flex-1 flex-row no-overflow-y">
        <CurrentSuiteTestList
          activeSuite={activeSuiteID}
          selectedIndexes={editor.selectedTestIndexes}
          tests={activeTests}
        />
        <AvailableSuiteTestList
          activeSuite={activeSuiteID}
          allTests={tests}
        />
      </Box>
      <Paper
        className="flex-initial"
        elevation={1}
        id="suite-editor"
        square
      >
        <SuiteEditor suite={activeSuite} />
      </Paper>
    </>
  )
}

export default SuiteCustomizer
