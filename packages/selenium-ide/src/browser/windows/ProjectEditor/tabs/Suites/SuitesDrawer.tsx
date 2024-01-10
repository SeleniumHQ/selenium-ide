import List from '@mui/material/List'
import React from 'react'
import Drawer from '../../components/Drawer/Wrapper'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import RenamableListItem from '../../components/Drawer/RenamableListItem'
import SuiteNewDialog from './SuiteNewDialog'
import { SIDEMainProps } from '../../components/types'

const {
  state: { setActiveSuite: setSelected },
  suites: { update },
} = window.sideAPI

const rename = (id: string, name: string) => update(id, { name })

const SuiteList: React.FC<
  Pick<SIDEMainProps, 'openDrawer' | 'session' | 'setOpenDrawer'>
> = ({ openDrawer, session, setOpenDrawer }) => {
  const {
    project: { suites },
    state: { activeSuiteID },
  } = session
  const [confirmNew, setConfirmNew] = React.useState(false)

  return (
    <Drawer
      className="flex flex-col h-100"
      open={openDrawer}
      header="Select Suite"
      setOpen={setOpenDrawer}
    >
      <EditorToolbar
        className="flex-initial"
        onAdd={async () => {
          console.log('setIsOpen(true)')
          setConfirmNew(true)
        }}
        onRemove={
          suites.length > 1
            ? () => {
                const doDelete = window.confirm('Delete this suite?')
                if (doDelete) {
                  window.sideAPI.suites.delete(activeSuiteID)
                }
              }
            : undefined
        }
      />
      <List
        className="flex-col flex-1 overflow-y pt-0"
        dense
        sx={{ borderColor: 'primary.main' }}
      >
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
      <SuiteNewDialog confirmNew={confirmNew} setConfirmNew={setConfirmNew} />
    </Drawer>
  )
}

export default SuiteList
