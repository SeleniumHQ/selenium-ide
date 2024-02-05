import List from '@mui/material/List'
import React, { FC } from 'react'
import Drawer from 'browser/components/Drawer/Wrapper'
import EditorToolbar from 'browser/components/Drawer/EditorToolbar'
import RenamableListItem from 'browser/components/Drawer/RenamableListItem'
import SuiteCreateDialog from './SuiteCreateDialog'
import { SIDEMainProps } from 'browser/components/types'

const {
  state: { setActiveSuite: setSelected },
  suites: { update },
} = window.sideAPI

const rename = (id: string, name: string) => update(id, { name })

const SuitesDrawer: FC<Pick<SIDEMainProps, 'session'>> = ({ session }) => {
  const {
    project: { suites },
    state: { activeSuiteID: activeSuite },
  } = session
  const [confirmNew, setConfirmNew] = React.useState(false)

  return (
    <Drawer>
      <SuiteCreateDialog open={confirmNew} setOpen={setConfirmNew} />
      <EditorToolbar
        onAdd={() => setConfirmNew(true)}
        onRemove={
          suites.length > 1
            ? () => {
                const doDelete = window.confirm('Delete this suite?')
                if (doDelete) {
                  window.sideAPI.suites.delete(activeSuite)
                }
              }
            : undefined
        }
      />
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
              selected={id === activeSuite}
              setSelected={setSelected}
            />
          ))}
      </List>
    </Drawer>
  )
}

export default SuitesDrawer
