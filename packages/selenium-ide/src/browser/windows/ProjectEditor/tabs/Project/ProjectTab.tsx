import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { SIDEMainProps } from 'browser/components/types'
import React, { FC } from 'react'
import ProjectSettings from './ProjectSettings'
import SystemSettings from './SystemSettings'

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
  Pick<SIDEMainProps, 'session' | 'setTab' | 'tab'>
> = ({ session }) => (
  <Box className="fill flex flex-col">
    <Paper elevation={1} id="project-editor" square>
      <SettingsWrapper session={session} />
    </Paper>
  </Box>
)

export default ProjectTab
