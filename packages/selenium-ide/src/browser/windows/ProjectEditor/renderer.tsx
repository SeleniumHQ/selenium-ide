import AppBar from './components/AppBar'
import Box from '@mui/material/Box'
<<<<<<< HEAD
=======
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import MenuIcon from '@mui/icons-material/Menu'
>>>>>>> ccb2f034 (More space for commands by reducing appbar, hack to scroll playback selected command)
import loadingID from 'api/constants/loadingID'
import AppWrapper from 'browser/components/AppWrapper'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Drawer from './components/Drawer'
import Main from './components/Main'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import { PROJECT_TAB, TAB, TESTS_TAB } from './enums/tab'

const ProjectTestCommandList = () => {
  const session = subscribeToSession()
  const {
    project: { id },
  } = session

  const [tab, setTab] = React.useState<TAB>(TESTS_TAB)
  const [_openDrawer, setOpenDrawer] = React.useState(true)
  const openDrawer = _openDrawer && tab !== PROJECT_TAB

  if (id == loadingID) {
    return <div id="loading" />
  }

  return (
    <AppWrapper>
      <DndProvider backend={HTML5Backend}>
        <Box className="flex">
<<<<<<< HEAD
          <AppBar
            openDrawer={openDrawer}
            session={session}
            setOpenDrawer={setOpenDrawer}
            setTab={setTab}
            tab={tab}
          />
          <Drawer
            open={openDrawer}
            session={session}
            setOpen={setOpenDrawer}
            tab={tab}
          />
=======
          <AppBar className="draggable" position="fixed" open={openDrawer}>
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
              {/* <Typography variant="h6" noWrap component="div">
                Selenium IDE
              </Typography> */}
              {/* <div className="flex-1" /> */}
            <Tabs
              aria-label="Selenium IDE workflows"
              className="not-draggable"
              indicatorColor="secondary"
              onChange={(_e, v) => setTab(v)}
              textColor="inherit"
              variant="fullWidth"
              value={tab}
            >
              <Tab label="Tests" {...a11yProps(TESTS_TAB)} />
              <Tab label="Suites" {...a11yProps(SUITES_TAB)} />
              <Tab label="Config" {...a11yProps(PROJECT_TAB)} />
              <TabPanel index={TESTS_TAB} value={tab}>
                <TestControls state={state} />
              </TabPanel>
              <TabPanel index={SUITES_TAB} value={tab}>
                <SuiteControls state={state} />
              </TabPanel>
              <TabPanel index={PROJECT_TAB} value={tab} />
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
>>>>>>> ccb2f034 (More space for commands by reducing appbar, hack to scroll playback selected command)
          <Main
            openDrawer={openDrawer}
            session={session}
            tab={tab}
          />
        </Box>
      </DndProvider>
    </AppWrapper>
  )
}

renderWhenReady(ProjectTestCommandList)
