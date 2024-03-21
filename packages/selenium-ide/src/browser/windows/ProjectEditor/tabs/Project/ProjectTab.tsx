import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { SIDEMainProps } from 'browser/components/types'
import React, { FC, useContext } from 'react'
import ProjectSettings from './ProjectSettings'
import SystemSettings from './SystemSettings'
import SettingsTabs from './SettingTabs'
import { context as showDrawerContext } from 'browser/contexts/show-drawer'
import { context } from 'browser/contexts/config-settings-group'

export interface MiniProjectShape {
  id: string
  name: string
}

const SettingsWrapper: FC = () =>
  useContext(context) === 'project' ? (
    <ProjectSettings />
  ) : (
    <SystemSettings />
  )

const ProjectTab: React.FC<Pick<SIDEMainProps, 'setTab' | 'tab'>> = () => (
  <Box className="fill flex flex-col">
    {!useContext(showDrawerContext) && <SettingsTabs />}
    <Paper elevation={1} id="project-editor" square>
      <SettingsWrapper />
    </Paper>
  </Box>
)

export default ProjectTab
