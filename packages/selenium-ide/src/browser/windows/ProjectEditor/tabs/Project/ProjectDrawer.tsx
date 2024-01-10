import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { ConfigSettingsGroup } from '@seleniumhq/side-api'
import React from 'react'
import Drawer from '../../components/Drawer/Wrapper'
import { SIDEMainProps } from '../../components/types'

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

const ProjectDrawer: React.FC<
  Pick<SIDEMainProps, 'openDrawer' | 'session' | 'setOpenDrawer'>
> = ({
  openDrawer,
  session: {
    state: {
      editor: { configSettingsGroup },
    },
  },
  setOpenDrawer,
}) => (
  <Drawer
    className="flex flex-col h-100"
    open={openDrawer}
    header="Settings Group"
    setOpen={setOpenDrawer}
  >
    <List dense className='pt-0' sx={{ borderColor: 'primary.main' }}>
      <ProjectConfig value={configSettingsGroup} />
      <SystemConfig value={configSettingsGroup} />
    </List>
  </Drawer>
)

export default ProjectDrawer
