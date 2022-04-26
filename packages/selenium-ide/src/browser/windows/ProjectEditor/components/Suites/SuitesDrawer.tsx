import List from '@mui/material/List'
import { SuiteShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import Drawer from '../Drawer'
import EditorToolbar from '../Drawer/EditorToolbar'
import RenamableListItem from '../Drawer/RenamableListItem'

export interface SuiteListProps {
  activeSuite: string
  open: boolean
  setOpen: (b: boolean) => void
  suites: SuiteShape[]
}

const {
  state: { setActiveSuite: setSelected },
  suites: { update },
} = window.sideAPI

const rename = (id: string, name: string) => update(id, { name })

const SuiteList: FC<SuiteListProps> = ({
  activeSuite,
  open,
  setOpen,
  suites,
}) => (
  <Drawer
    footerID="suite-editor"
    open={open}
    header="Select Suite"
    setOpen={setOpen}
  >
    <List
      dense
      sx={{ borderColor: 'primary.main' }}
      subheader={
        <EditorToolbar
          onAdd={() => window.sideAPI.suites.create()}
          onRemove={
            suites.length > 1
              ? () => window.sideAPI.suites.delete(activeSuite)
              : undefined
          }
          sx={{
            top: '47px',
            zIndex: 100,
          }}
        />
      }
    >
      {suites
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ id, name }) => (
          <RenamableListItem
            id={id}
            key={id}
            name={name}
            rename={rename}
            selected={id === activeSuite}
            setSelected={setSelected}
          />
        ))}
    </List>
  </Drawer>
)

export default SuiteList
