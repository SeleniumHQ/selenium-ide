import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import React from 'react'
import TabPanel from '../Tab/Panel'
import SuiteControls from 'browser/windows/ProjectEditor/tabs/Suites/Controls'
import TestControls from 'browser/windows/ProjectEditor/tabs/Tests/Controls'
import { SUITES_TAB, TESTS_TAB } from 'browser/enums/tab'
import { SIDEMainProps } from '../types'
import AppBarTabs from './AppBarTabs'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { getActiveTest } from '@seleniumhq/side-api'
import baseControlProps from '../Controls/BaseProps'

type SIDEAppBarProps = Pick<SIDEMainProps, 'session' | 'setTab' | 'tab'>

const SIDEAppBar: React.FC<SIDEAppBarProps> = ({ session, setTab, tab }) => {
  const showDrawer = session.state.editor.showDrawer
  return (
    <Paper className="flex flex-row width-100 z-3" elevation={1} square>
      <IconButton
        {...baseControlProps}
        aria-label={showDrawer ? 'Close drawer' : 'Open drawer'}
        onClick={() =>
          window.sideAPI.state.set('editor.showDrawer', !showDrawer)
        }
      >
        {showDrawer ? <MenuOpenIcon /> : <MenuIcon />}
      </IconButton>
      <AppBarTabs setTab={setTab} tab={tab} />
      <div className="flex flex-1" />
      <TabPanel index={TESTS_TAB} value={tab}>
        <TestControls state={session.state} test={getActiveTest(session)} />
      </TabPanel>
      <TabPanel index={SUITES_TAB} value={tab}>
        <SuiteControls state={session.state} />
      </TabPanel>
    </Paper>
  )
}

export default SIDEAppBar
