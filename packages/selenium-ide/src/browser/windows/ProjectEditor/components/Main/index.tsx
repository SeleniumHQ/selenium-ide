import React from 'react'
import Main from './MainCore'
import TabPanel from '../Tab/Panel'
import { PROJECT_TAB, SUITES_TAB, TESTS_TAB } from '../../enums/tab'
import ProjectTab from '../../tabs/Project/ProjectTab'
import SuitesTab from '../../tabs/Suites/SuitesTab'
import TestsTab from '../../tabs/Tests/TestsTab'
import { SIDEMainProps } from '../types'

const SIDEMain: React.FC<
  Pick<SIDEMainProps, 'openDrawer' | 'session' | 'tab'>
> = ({ openDrawer, session, tab }) => (
  <Main
    className="fill no-select"
    hasDrawer={tab !== PROJECT_TAB}
    openDrawer={openDrawer}
  >
    <TabPanel index={TESTS_TAB} value={tab}>
      <TestsTab session={session} />
    </TabPanel>
    <TabPanel index={SUITES_TAB} value={tab}>
      <SuitesTab session={session} />
    </TabPanel>
    <TabPanel index={PROJECT_TAB} value={tab}>
      <ProjectTab session={session} />
    </TabPanel>
  </Main>
)

export default SIDEMain
