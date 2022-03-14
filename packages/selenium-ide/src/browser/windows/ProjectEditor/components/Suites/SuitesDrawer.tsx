import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { SuiteShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import Drawer from '../Drawer'
import EditorToolbar from '../Drawer/EditorToolbar'

export interface SuiteListProps {
  activeSuite: string
  open: boolean
  setOpen: (b: boolean) => void
  suites: SuiteShape[]
}

const SuiteList: FC<SuiteListProps> = ({
  activeSuite,
  open,
  setOpen,
  suites,
}) => {
  return (
    <Drawer
      footerID="suite-editor"
      open={open}
      header="Select Test"
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
        {suites.map(({ id, name }) => (
          <ListItem
            disablePadding
            key={id}
            onClick={() => window.sideAPI.state.setActiveSuite(id)}
          >
            <ListItemButton disableRipple selected={id === activeSuite}>
              <ListItemText>{name}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

export default SuiteList
