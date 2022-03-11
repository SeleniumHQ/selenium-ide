import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import { TestShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'

export interface TestListProps {
  activeTest: string
  tests: TestShape[]
}

const { state: { setActiveTest } } = window.sideAPI

const TestList: FC<TestListProps> = ({ activeTest, tests }) => (
  <List
    dense
    sx={{ borderColor: 'primary.main' }}
    subheader={<ListSubheader className="lh-36">Tests</ListSubheader>}
  >
    {tests.map(({ id, name }) => (
      <ListItem disablePadding key={id} onClick={() => setActiveTest(id)}>
        <ListItemButton disableRipple selected={id === activeTest}>
          <ListItemText>{name}</ListItemText>
        </ListItemButton>
      </ListItem>
    ))}
  </List>
)

export default TestList
