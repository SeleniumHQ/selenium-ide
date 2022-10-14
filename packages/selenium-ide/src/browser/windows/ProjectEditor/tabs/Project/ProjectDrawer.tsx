import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { ConfigSettingsGroup } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import Drawer from '../../components/Drawer/Wrapper'

export interface ProjectDrawerProps {
  configSettingsGroup: ConfigSettingsGroup
  open: boolean
  setOpen: (b: boolean) => void
}

type ConfigGroupFactory = (
  group: ConfigSettingsGroup
) => React.FC<{ value: ConfigSettingsGroup }>

const ConfigGroup: ConfigGroupFactory =
  (group) =>
  ({ value }) =>
    (
      <ListItemButton
        disableRipple
        id={group}
        onClick={() =>
          window.sideAPI.state.set('editor.configSettingsGroup', group)
        }
        selected={value === group}
      >
        <ListItemText>
          {group.slice(0, 1).toUpperCase().concat(group.slice(1))}
        </ListItemText>
      </ListItemButton>
    )

const ProjectConfig = ConfigGroup('project')
const SystemConfig = ConfigGroup('system')

const ProjectDrawer: FC<ProjectDrawerProps> = ({
  configSettingsGroup,
  open,
  setOpen,
}) => (
  <Drawer
    footerID="project-editor"
    open={open}
    header="Settings Group"
    setOpen={setOpen}
  >
    <List dense sx={{ borderColor: 'primary.main' }}>
      <ProjectConfig value={configSettingsGroup} />
      <SystemConfig value={configSettingsGroup} />
    </List>
  </Drawer>
)

export default ProjectDrawer
