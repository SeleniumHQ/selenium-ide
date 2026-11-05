import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { SIDEMainProps } from 'browser/components/types'
import React, { FC, use } from 'react'
import OutPutSettings from './OutPutSettings'
import ProjectSettings from './ProjectSettings'
import SystemSettings from './SystemSettings'
import SettingsTabs from './SettingTabs'
import { context as showDrawerContext } from 'browser/contexts/show-drawer'
import { context } from 'browser/contexts/config-settings-group'

export interface MiniProjectShape {
  id: string
  name: string
}

const SettingsWrapper: FC = () => {
  const configSettingsGroup = use(context)
  switch (configSettingsGroup) {
    case 'outPut':
      return <OutPutSettings />
    case 'project':
      return <ProjectSettings />
    case 'system':
      return <SystemSettings />
  }
}

const ProjectTab: React.FC<Pick<SIDEMainProps, 'setTab' | 'tab'>> = () => (
  <Box className="fill flex flex-col">
    {!use(showDrawerContext) && <SettingsTabs />}
    <Paper elevation={1} id="project-editor" square>
      <SettingsWrapper />
    </Paper>
  </Box>
)

export default ProjectTab
