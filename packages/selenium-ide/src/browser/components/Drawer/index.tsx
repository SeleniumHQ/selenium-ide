import React from 'react'
import TabPanel from '../Tab/Panel'
import { PROJECT_TAB, SUITES_TAB, TESTS_TAB } from '../../enums/tab'
import { SIDEMainProps } from '../types'
import TestsDrawer from 'browser/windows/ProjectEditor/tabs/Tests/TestsDrawer'
import SuitesDrawer from 'browser/windows/ProjectEditor/tabs/Suites/SuitesDrawer'
import ProjectDrawer from 'browser/windows/ProjectEditor/tabs/Project/ProjectDrawer'

const SIDEDrawer: React.FC<Pick<SIDEMainProps, 'tab'>> = ({
  tab,
}) => (
  <>
    <TabPanel index={TESTS_TAB} value={tab}>
      <TestsDrawer />
    </TabPanel>
    <TabPanel index={SUITES_TAB} value={tab}>
      <SuitesDrawer />
    </TabPanel>
    <TabPanel index={PROJECT_TAB} value={tab}>
      <ProjectDrawer />
    </TabPanel>
  </>
)

export default SIDEDrawer
