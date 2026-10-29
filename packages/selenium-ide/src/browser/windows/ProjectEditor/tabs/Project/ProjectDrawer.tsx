import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { ConfigSettingsGroup } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import Drawer from 'browser/components/Drawer/Wrapper'
import { context } from 'browser/contexts/config-settings-group'
import languageMap from 'browser/I18N/keys'
import { FormattedMessage } from 'react-intl'

type ConfigGroupFactory = (
  group: ConfigSettingsGroup
) => React.FC<{ value: ConfigSettingsGroup }>

/*************以下是我新增****************/
// const itemMap = { project: "项目配置", system: "系统配置", "outPut": "导出配置" };
/*************以上是我新增****************/

const ConfigGroup: ConfigGroupFactory = (group) => {
  const ConfigGroupItem = ({ value }: { value: ConfigSettingsGroup }) => (
    <ListItemButton
      disableRipple
      id={group}
      onClick={() =>
        window.sideAPI.state.set('editor.configSettingsGroup', group)
      }
      selected={value === group}
    >
      <ListItemText>
        <FormattedMessage id={languageMap.configTab[group]} />
        {/*{group === "outPut" ? "导出" : group.slice(0, 1).toUpperCase().concat(group.slice(1))}*/}
      </ListItemText>
    </ListItemButton>
  )
  return ConfigGroupItem
}

const ProjectConfig = ConfigGroup('project')
const SystemConfig = ConfigGroup('system')
const OutPutConfig = ConfigGroup('outPut')

const ProjectDrawer: FC = () => {
  const configSettingsGroup = React.useContext(context)
  return (
    <Drawer header={<FormattedMessage id={languageMap.mainMenu.config} />}>
      <List dense>
        <ProjectConfig value={configSettingsGroup} />
        <SystemConfig value={configSettingsGroup} />
        <OutPutConfig value={configSettingsGroup} />
      </List>
    </Drawer>
  )
}

export default ProjectDrawer
