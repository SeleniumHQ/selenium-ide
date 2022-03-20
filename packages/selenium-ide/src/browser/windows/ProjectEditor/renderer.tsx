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
import SuitesDrawer from './components/Suites/SuitesDrawer'
import SuitesTab from './components/Suites/SuitesTab'
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

const ProjectTestCommandList = () => {
  const session = subscribeToSession()
  const {
    project: { id, suites, tests },
    state: { activeSuiteID, activeTestID },
  } = session

  const [tab, setTab] = React.useState(0)
  const [_openDrawer, setOpenDrawer] = React.useState(true)
  const openDrawer = _openDrawer && tab !== 2

  if (id == loadingID) {
    return null
  }

  return (
    <AppWrapper>
      <Box sx={{ display: 'flex' }}>
        <AppBar className="draggable" position="fixed" open={openDrawer}>
          <Toolbar className="" variant="dense">
            <TabPanelMulti indexes={[0, 1]} value={tab}>
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
            <TabPanel index={2} value={tab} />
            <Typography variant="h6" noWrap component="div">
              Selenium IDE
            </Typography>
          </Toolbar>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="Selenium IDE workflows"
          >
            <Tab label="Tests" {...a11yProps(0)} />
            <Tab label="Suites" {...a11yProps(1)} />
            <Tab label="Config" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <TabPanel index={0} value={tab}>
          <TestsDrawer
            activeTest={activeTestID}
            open={openDrawer}
            setOpen={setOpenDrawer}
            tests={tests}
          />
        </TabPanel>
        <TabPanel index={1} value={tab}>
          <SuitesDrawer
            activeSuite={activeSuiteID}
            open={openDrawer}
            setOpen={setOpenDrawer}
            suites={suites}
          />
        </TabPanel>
        <Main className="fill no-select" open={openDrawer}>
          <TabPanel index={0} value={tab}>
            <TestsTab session={session} />
          </TabPanel>
          <TabPanel index={1} value={tab}>
            <SuitesTab session={session} />
          </TabPanel>
          <TabPanel index={2} value={tab}>
            <ProjectTab open={openDrawer} session={session} />
          </TabPanel>
        </Main>
      </Box>
    </AppWrapper>
  )
}

renderWhenReady(ProjectTestCommandList)
