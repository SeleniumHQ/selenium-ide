import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import MenuIcon from '@mui/icons-material/Menu'
import loadingID from 'api/constants/loadingID'
import AppWrapper from 'browser/components/AppWrapper'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import SuiteControls from './components/Suites/Controls'
import SuitesDrawer from './components/Suites/SuitesDrawer'
import SuitesTab from './components/Suites/SuitesTab'
import TestControls from './components/Tests/Controls'
import TestsDrawer from './components/Tests/TestsDrawer'
import TestsTab from './components/Tests/TestsTab'
import Main from './components/Main'
import AppBar from './components/AppBar'
import TabPanel from './components/Tab/Panel'
import TabPanelMulti from './components/Tab/PanelMulti'
import ProjectTab from './components/Project/ProjectTab'
import renderWhenReady from 'browser/helpers/renderWhenReady'

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  }
}

const TESTS_TAB = 0
const SUITES_TAB = 1
const PROJECT_TAB = 2

const ProjectTestCommandList = () => {
  const session = subscribeToSession()
  const {
    project: { id, suites, tests },
    state,
  } = session
  const { activeSuiteID, activeTestID } = state

  const [tab, setTab] = React.useState(0)
  const [_openDrawer, setOpenDrawer] = React.useState(true)
  const openDrawer = _openDrawer && tab !== 2

  console.log(session)
  if (id == loadingID) {
    return null
  }

  return (
    <AppWrapper>
      <DndProvider backend={HTML5Backend}>
        <Box sx={{ display: 'flex' }}>
          <AppBar className="draggable" position="fixed" open={openDrawer}>
            <Toolbar className="" variant="dense">
              <TabPanelMulti indexes={[TESTS_TAB, SUITES_TAB]} value={tab}>
                <IconButton
                  color="inherit"
                  aria-label="openDrawer drawer"
                  onClick={() => setOpenDrawer(true)}
                  edge="start"
                  sx={{ mr: 2, ...(openDrawer && { display: 'none' }) }}
                >
                  <MenuIcon />
                </IconButton>
              </TabPanelMulti>
              <TabPanel index={PROJECT_TAB} value={tab} />
              <Typography variant="h6" noWrap component="div">
                Selenium IDE
              </Typography>
              <div className="flex-1" />
              <TabPanel index={TESTS_TAB} value={tab}>
                <TestControls state={state} />
              </TabPanel>
              <TabPanel index={SUITES_TAB} value={tab}>
                <SuiteControls state={state} />
              </TabPanel>
              <TabPanel index={PROJECT_TAB} value={tab} />
            </Toolbar>
            <Tabs
              value={tab}
              onChange={(_e, v) => setTab(v)}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="Selenium IDE workflows"
            >
              <Tab label="Tests" {...a11yProps(TESTS_TAB)} />
              <Tab label="Suites" {...a11yProps(SUITES_TAB)} />
              <Tab label="Config" {...a11yProps(PROJECT_TAB)} />
            </Tabs>
          </AppBar>
          <TabPanel index={TESTS_TAB} value={tab}>
            <TestsDrawer
              activeTest={activeTestID}
              open={openDrawer}
              setOpen={setOpenDrawer}
              tests={tests}
            />
          </TabPanel>
          <TabPanel index={SUITES_TAB} value={tab}>
            <SuitesDrawer
              activeSuite={activeSuiteID}
              open={openDrawer}
              setOpen={setOpenDrawer}
              suites={suites}
            />
          </TabPanel>
          <Main
            className="fill no-select"
            open={tab === PROJECT_TAB || openDrawer}
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
        </Box>
      </DndProvider>
    </AppWrapper>
  )
}

renderWhenReady(ProjectTestCommandList)
