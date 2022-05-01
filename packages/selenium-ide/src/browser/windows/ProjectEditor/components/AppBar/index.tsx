import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import React from 'react'
import AppBarCore from './AppBarCore'
import TabPanel from '../Tab/Panel'
import TabPanelMulti from '../Tab/PanelMulti'
import SuiteControls from '../../tabs/Suites/Controls'
import TestControls from '../../tabs/Tests/Controls'
import { SUITES_TAB, TESTS_TAB } from '../../enums/tab'
import { SIDEMainProps } from '../types'
import AppBarTabs from './AppBarTabs'

const SIDEAppBar: React.FC<SIDEMainProps> = ({
  openDrawer,
  session,
  setOpenDrawer,
  setTab,
  tab,
}) => {
  return (
    <AppBarCore className="draggable" position="fixed" openDrawer={openDrawer}>
      <TabPanelMulti indexes={[TESTS_TAB, SUITES_TAB]} value={tab}>
        <IconButton
          color="inherit"
          aria-label="openDrawer drawer"
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
      </TabPanelMulti>
      <AppBarTabs setTab={setTab} tab={tab} />
      <TabPanel index={TESTS_TAB} value={tab}>
        <TestControls state={session.state} />
      </TabPanel>
      <TabPanel index={SUITES_TAB} value={tab}>
        <SuiteControls state={session.state} />
      </TabPanel>
    </AppBarCore>
  )
}

export default SIDEAppBar
