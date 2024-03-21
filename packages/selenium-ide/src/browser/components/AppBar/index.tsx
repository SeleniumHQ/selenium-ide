import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import React, { useContext } from 'react'
import SuiteControls from 'browser/windows/ProjectEditor/tabs/Suites/Controls'
import TestControls from 'browser/windows/ProjectEditor/tabs/Tests/Controls'
import { SUITES_TAB, TESTS_TAB } from 'browser/enums/tab'
import { SIDEMainProps } from '../types'
import AppBarTabs from './AppBarTabs'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { context } from 'browser/contexts/show-drawer'
import baseControlProps from '../Controls/BaseProps'
import TabPanel from '../Tab/Panel'

type SIDEAppBarProps = Pick<SIDEMainProps, 'setTab' | 'tab'>

const SIDEAppBar: React.FC<SIDEAppBarProps> = ({ setTab, tab }) => {
  const showDrawer = useContext(context)
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
        <TestControls />
      </TabPanel>
      <TabPanel index={SUITES_TAB} value={tab}>
        <SuiteControls />
      </TabPanel>
    </Paper>
  )
}

export default SIDEAppBar
