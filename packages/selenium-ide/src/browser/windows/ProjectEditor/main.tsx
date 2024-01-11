import Box from '@mui/material/Box'
import { loadingID } from '@seleniumhq/side-api/dist/constants/loadingID'
import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Main from './components/Main'
import { TAB, TESTS_TAB } from './enums/tab'
import { SIDEMainProps } from './components/types'

const ProjectEditor: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => {
  const [tab, setTab] = React.useState<TAB>(TESTS_TAB)
  if (session.project.id === loadingID) {
    return <div id="loading" />
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <Box className="fill flex flex-col">
        <Main
          session={session}
          setTab={setTab}
          tab={tab}
        />
      </Box>
    </DndProvider>
  )
}

export default ProjectEditor
