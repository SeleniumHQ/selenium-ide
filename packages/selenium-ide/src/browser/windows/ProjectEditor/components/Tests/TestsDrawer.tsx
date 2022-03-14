import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { TestShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import Drawer from '../Drawer'
import EditorToolbar from '../Drawer/EditorToolbar'

export interface TestListProps {
  activeTest: string
  open: boolean
  setOpen: (b: boolean) => void
  tests: TestShape[]
}

const {
  state: { setActiveTest },
} = window.sideAPI

const TestList: FC<TestListProps> = ({ activeTest, open, setOpen, tests }) => (
  <Drawer
    footerID="command-editor"
    open={open}
    header="Select Test"
    setOpen={setOpen}
  >
    <List
      dense
      sx={{ borderColor: 'primary.main' }}
      subheader={
        <EditorToolbar
          onAdd={() => window.sideAPI.tests.create()}
          onRemove={
            tests.length > 1
              ? () => window.sideAPI.tests.delete(activeTest)
              : undefined
          }
          sx={{
            top: '47px',
            zIndex: 100,
          }}
        />
      }
    >
      {tests.map(({ id, name }) => (
        <ListItem disablePadding key={id} onClick={() => setActiveTest(id)}>
          <ListItemButton disableRipple selected={id === activeTest}>
            <ListItemText>{name}</ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Drawer>
)

export default TestList
