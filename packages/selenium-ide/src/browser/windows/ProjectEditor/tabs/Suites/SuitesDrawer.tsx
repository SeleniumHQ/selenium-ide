import List from '@mui/material/List'
import React, { FC, useContext } from 'react'
import Drawer from 'browser/components/Drawer/Wrapper'
import RenamableListItem from 'browser/components/Drawer/RenamableListItem'
import { context as activeTestContext } from 'browser/contexts/active-test'
import { context } from 'browser/contexts/suites'
import SuitesToolbar from './Toolbar'

const {
  state: { setActiveSuite: setSelected },
  suites: { update },
} = window.sideAPI

const rename = (id: string, name: string) => update(id, { name })

const SuitesDrawer: FC = () => {
  const {activeSuiteID} = useContext(activeTestContext)
  const suites = useContext(context)

  return (
    <Drawer>
      <SuitesToolbar />
      <List className='flex-col flex-1 overflow-y' dense>
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
