import Box from '@mui/material/Box'
import { loadingID } from '@seleniumhq/side-api/dist/constants/loadingID'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Main from './components/Main'
import URLBar from './components/URLBar'
import { TAB, TESTS_TAB } from './enums/tab'

const ProjectEditor = () => {
  const session = subscribeToSession()
  const {
    project: { id },
  } = session

  const [tab, setTab] = React.useState<TAB>(TESTS_TAB)
  const [openDrawer, setOpenDrawer] = React.useState(true)

  if (id == loadingID) {
    return <div id="loading" />
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box className="fill flex flex-col">
        <URLBar session={session} />
        <Box className="flex-1 width-100">
          <Main
            openDrawer={openDrawer}
            session={session}
            setOpenDrawer={setOpenDrawer}
            setTab={setTab}
            tab={tab}
          />
        </Box>
      </Box>
    </DndProvider>
  )
}

export default ProjectEditor
