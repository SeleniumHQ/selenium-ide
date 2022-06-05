import List from '@mui/material/List'
import { EditorStateShape } from '@seleniumhq/side-api'
import { SuiteShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import Drawer from '../../components/Drawer/Wrapper'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import RenamableListItem from '../../components/Drawer/RenamableListItem'

export interface SuiteListProps {
  activeSuite: string
  open: boolean
  setOpen: (b: boolean) => void
  suiteMode: EditorStateShape['suiteMode']
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
  suiteMode,
  suites,
}) => (
  <Drawer
    footerID={suiteMode === 'editor' ? "suite-editor" : ''}
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
