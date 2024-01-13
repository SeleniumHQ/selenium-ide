import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import React from 'react'
import { SIDEMainProps } from '../../../../components/types'

function a11yProps(name: string) {
  return {
    'aria-controls': `tabpanel-${name}`,
    id: `${name}`,
  }
}

const SettingsTabs: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => (
  <Tabs
    aria-label="Selenium IDE workflows"
    className="not-draggable"
    indicatorColor="primary"
    onChange={(_e, group) => {
      window.sideAPI.state.set('editor.configSettingsGroup', group)
    }}
    textColor="inherit"
    value={session.state.editor.configSettingsGroup}
    variant='fullWidth'
  >
    <Tab label="Project" value="project" {...a11yProps('project')} />
    <Tab label="System" value="system" {...a11yProps('system')} />
  </Tabs>
)

export default SettingsTabs
