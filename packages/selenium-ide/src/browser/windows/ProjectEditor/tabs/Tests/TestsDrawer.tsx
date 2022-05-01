import List from '@mui/material/List'
import { TestShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import Drawer from '../../components/Drawer/Wrapper'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import RenamableListItem from '../../components/Drawer/RenamableListItem'

export interface TestListProps {
  activeTest: string
  open: boolean
  setOpen: (b: boolean) => void
  tests: TestShape[]
}

const {
  state: { setActiveTest: setSelected },
  tests: { rename },
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
      {tests
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ id, name }) => (
          <RenamableListItem
            id={id}
            key={id}
            name={name}
            rename={rename}
            selected={id === activeTest}
            setSelected={setSelected}
          />
        ))}
    </List>
  </Drawer>
)

export default TestList
