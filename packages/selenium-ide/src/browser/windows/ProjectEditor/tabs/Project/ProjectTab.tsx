import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import React, { FC } from 'react'
import ProjectSettings from './ProjectSettings'
import SystemSettings from './SystemSettings'
import { SIDEMainProps } from '../../components/types'
import AppBar from '../../components/AppBar'
import ProjectDrawer from './ProjectDrawer'

export interface MiniProjectShape {
  id: string
  name: string
}

const SettingsWrapper: FC<Pick<SIDEMainProps, 'session'>> = ({
  session: { project, state },
}) =>
  state.editor.configSettingsGroup === 'project' ? (
    <ProjectSettings project={project} />
  ) : (
    <SystemSettings state={state} />
  )

const ProjectTab: React.FC<
  Pick<
    SIDEMainProps,
    'openDrawer' | 'session' | 'setOpenDrawer' | 'setTab' | 'tab'
  >
> = ({ openDrawer, session, setOpenDrawer, setTab, tab }) => (
  <Box className="fill flex flex-col">
    <Box className="flex-initial">
      <AppBar
        openDrawer={openDrawer}
        session={session}
        setOpenDrawer={setOpenDrawer}
        setTab={setTab}
        tab={tab}
      />
    </Box>
    <Box className="flex-1 flex-row">
      <Box className="flex-initial">
        <ProjectDrawer
          openDrawer={openDrawer}
          session={session}
          setOpenDrawer={setOpenDrawer}
        />
      </Box>
      <Box className="flex-1 flex-col">
        <Paper elevation={1} id="project-editor" square>
          <SettingsWrapper session={session} />
        </Paper>
      </Box>
    </Box>
  </Box>
)

export default ProjectTab
