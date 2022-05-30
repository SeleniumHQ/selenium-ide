import AppBar from './components/AppBar'
import Box from '@mui/material/Box'
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

const ProjectEditor = () => {
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

renderWhenReady(ProjectEditor)
