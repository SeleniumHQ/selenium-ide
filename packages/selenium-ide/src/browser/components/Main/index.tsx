import React from 'react'
import TabPanel from '../Tab/Panel'
import { PROJECT_TAB, SUITES_TAB, TESTS_TAB } from '../../enums/tab'
import ProjectTab from '../../windows/ProjectEditor/tabs/Project/ProjectTab'
import SuitesTab from '../../windows/ProjectEditor/tabs/Suites/SuitesTab'
import TestsTab from '../../windows/ProjectEditor/tabs/Tests/TestsTab'
import { SIDEMainProps } from '../types'

const SIDEMain: React.FC<Pick<SIDEMainProps, 'session' | 'setTab' | 'tab'>> = ({
  session,
  setTab,
  tab,
}) => (
  <>
    <TabPanel index={TESTS_TAB} value={tab}>
      <TestsTab
        session={session}
        setTab={setTab}
        tab={tab}
      />
    </TabPanel>
    <TabPanel index={SUITES_TAB} value={tab}>
      <SuitesTab
        session={session}
        setTab={setTab}
        tab={tab}
      />
    </TabPanel>
    <TabPanel index={PROJECT_TAB} value={tab}>
      <ProjectTab
        session={session}
        setTab={setTab}
        tab={tab}
      />
    </TabPanel>
  </>
)

export default SIDEMain
