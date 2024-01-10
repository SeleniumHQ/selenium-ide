import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import React from 'react'
import TabPanel from '../Tab/Panel'
import SuiteControls from '../../tabs/Suites/Controls'
import TestControls from '../../tabs/Tests/Controls'
import { SUITES_TAB, TESTS_TAB } from '../../enums/tab'
import { SIDEMainProps } from '../types'
import AppBarTabs from './AppBarTabs'
import { Paper } from '@mui/material'

const SIDEAppBar: React.FC<SIDEMainProps> = ({
  openDrawer,
  session,
  setOpenDrawer,
  setTab,
  tab,
}) => {
  return (
    <Paper className="flex flex-row width-100" elevation={5} square>
      <IconButton
        aria-label="openDrawer drawer"
        color="inherit"
        onClick={() => setOpenDrawer(true)}
        sx={{
          flex: 0,
          paddingX: 2,
          borderRadius: 0.5,
          ...(openDrawer && { display: 'none' }),
        }}
        size="small"
      >
        <MenuIcon />
      </IconButton>
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
