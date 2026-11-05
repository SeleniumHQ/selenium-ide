import List from '@mui/material/List'
import Tooltip from '@mui/material/Tooltip'
import React, { FC, use } from 'react'
import Drawer from 'browser/components/Drawer/Wrapper'
import RenamableListItem from 'browser/components/Drawer/RenamableListItem'
import { context as activeTestContext } from 'browser/contexts/active-test'
import { context } from 'browser/contexts/suites'
import SuitesToolbar from './Toolbar'
import { FormattedMessage } from 'react-intl'
import languageMap from 'browser/I18N/keys'
import { QuestionMark } from '@mui/icons-material'

const {
  state: { setActiveSuite: setSelected },
  suites: { update },
} = window.sideAPI

const rename = (id: string, name: string) => update(id, { name })

const SuitesDrawer: FC = () => {
  const { activeSuiteID } = use(activeTestContext)
  const suites = use(context)
  return (
    <Drawer>
      <SuitesToolbar>
        <Tooltip
          title={<FormattedMessage id={languageMap.suitesTab.tooltip} />}
        >
          <QuestionMark
            className="mx-2"
            sx={{ color: 'primary.main', scale: 0.75 }}
          />
        </Tooltip>
      </SuitesToolbar>
      <List className="flex-col flex-1 overflow-y" dense>
        {suites
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ id, name }) => (
            <RenamableListItem
              id={id}
              key={id}
              name={name}
              onContextMenu={() => {
                window.sideAPI.menus.open('suiteManager', [id])
              }}
              rename={rename}
              selected={id === activeSuiteID}
              setSelected={setSelected}
            />
          ))}
      </List>
    </Drawer>
  )
}

export default SuitesDrawer
