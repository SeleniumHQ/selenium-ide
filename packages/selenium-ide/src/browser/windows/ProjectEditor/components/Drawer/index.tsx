import { CoreSessionData } from '@seleniumhq/side-api'
import React from 'react'
import { DrawerWrapperProps } from './Wrapper'
import TabPanel from '../Tab/Panel'
import { SUITES_TAB, TAB, TESTS_TAB } from '../../enums/tab'
import SuitesDrawer from '../../tabs/Suites/SuitesDrawer'
import TestsDrawer from '../../tabs/Tests/TestsDrawer'

interface SIDEDrawerProps extends Omit<DrawerWrapperProps, 'footerID' | 'header'> {
  session: CoreSessionData
  tab: TAB
}

const SIDEDrawer: React.FC<SIDEDrawerProps> = ({ session, tab, ...props }) => {
  const {
    project: { suites, tests },
    state: { activeSuiteID, activeTestID, editor: { suiteMode } },
  } = session
  return (
    <>
      <TabPanel index={TESTS_TAB} value={tab}>
        <TestsDrawer activeTest={activeTestID} tests={tests} {...props} />
      </TabPanel>
      <TabPanel index={SUITES_TAB} value={tab}>
        <SuitesDrawer activeSuite={activeSuiteID} suiteMode={suiteMode} suites={suites} {...props} />
      </TabPanel>
    </>
  )
}

export default SIDEDrawer
