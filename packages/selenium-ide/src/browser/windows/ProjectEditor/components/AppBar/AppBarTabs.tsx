import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import React from 'react'
import { PROJECT_TAB, SUITES_TAB, TESTS_TAB } from '../../enums/tab'
import { SIDEMainProps } from '../types'

function a11yProps(index: number) {
  return {
    'aria-controls': `tabpanel-${index}`,
    id: `tab-${index}`,
  }
}

const AppBarTabs: React.FC<Pick<SIDEMainProps, 'setTab' | 'tab'>> = ({
  setTab,
  tab,
}) => (
  <Tabs
    aria-label="Selenium IDE workflows"
    className="not-draggable"
    indicatorColor="secondary"
    onChange={(_e, v) => setTab(v)}
    textColor="inherit"
    value={tab}
  >
    <Tab label="Tests" {...a11yProps(TESTS_TAB)} />
    <Tab label="Suites" {...a11yProps(SUITES_TAB)} />
    <Tab label="Config" {...a11yProps(PROJECT_TAB)} />
  </Tabs>
)

export default AppBarTabs
