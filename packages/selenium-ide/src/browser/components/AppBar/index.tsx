import React from 'react'
import TabPanel from '../Tab/Panel'
import SuiteControls from '../../windows/ProjectEditor/tabs/Suites/Controls'
import TestControls from '../../windows/ProjectEditor/tabs/Tests/Controls'
import { SUITES_TAB, TESTS_TAB } from '../../enums/tab'
import { SIDEMainProps } from '../types'
import AppBarTabs from './AppBarTabs'
import { Paper } from '@mui/material'

const SIDEAppBar: React.FC<Pick<SIDEMainProps, 'session' | 'setTab' | 'tab'>> = ({
  session,
  setTab,
  tab,
}) => {
  return (
    <Paper className="flex flex-row width-100" elevation={15} square>
      <AppBarTabs setTab={setTab} tab={tab} />
      <div className="flex flex-1" />
      <TabPanel index={TESTS_TAB} value={tab}>
        <TestControls state={session.state} />
      </TabPanel>
      <TabPanel index={SUITES_TAB} value={tab}>
        <SuiteControls state={session.state} />
      </TabPanel>
    </Paper>
  )
}

export default SIDEAppBar
