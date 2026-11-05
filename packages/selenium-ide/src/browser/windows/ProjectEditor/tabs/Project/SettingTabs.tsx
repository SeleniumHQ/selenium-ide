import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import React, { use } from 'react'
import { context } from 'browser/contexts/config-settings-group'
import { FormattedMessage } from 'react-intl'
import languageMap from 'browser/I18N/keys'

function a11yProps(name: string) {
  return {
    'aria-controls': `tabpanel-${name}`,
    id: `${name}`,
  }
}

const SettingsTabs: React.FC = () => (
  <Tabs
    aria-label="Selenium IDE workflows"
    className="not-draggable"
    indicatorColor="primary"
    onChange={(_e, group) => {
      window.sideAPI.state.set('editor.configSettingsGroup', group)
    }}
    textColor="inherit"
    value={use(context)}
    variant="fullWidth"
  >
    <Tab
      label={<FormattedMessage id={languageMap.configTab.project} />}
      value="project"
      {...a11yProps('project')}
    />
    <Tab
      label={<FormattedMessage id={languageMap.configTab.system} />}
      value="system"
      {...a11yProps('system')}
    />
    <Tab
      label={<FormattedMessage id={languageMap.configTab.outPut} />}
      value="outPut"
      {...a11yProps('outPut')}
    />
  </Tabs>
)

export default SettingsTabs
