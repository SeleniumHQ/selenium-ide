import Paper from '@mui/material/Paper'
import { CoreSessionData } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import MainHeader from '../../components/Main/Header'
import ProjectSettings from './ProjectSettings'
import SystemSettings from './SystemSettings'

export interface ProjectTabProps {
  session: CoreSessionData
}

export interface MiniProjectShape {
  id: string
  name: string
}

const SettingsWrapper: FC<ProjectTabProps> = ({
  session: { project, state },
}) =>
  state.editor.configSettingsGroup === 'project' ? (
    <ProjectSettings project={project} />
  ) : (
    <SystemSettings state={state} />
  )

const ProjectTab: FC<ProjectTabProps> = ({ session }) => (
  <>
    <MainHeader />
    <Paper elevation={1} id="project-editor" square>
      <SettingsWrapper session={session} />
    </Paper>
  </>
)

export default ProjectTab
