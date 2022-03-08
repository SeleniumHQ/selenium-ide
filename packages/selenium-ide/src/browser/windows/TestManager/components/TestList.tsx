import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemButton from '@material-ui/core/ListItemButton'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import { TestShape } from '@seleniumhq/side-model'
import sideAPI from 'browser/helpers/getSideAPI'
import React, { FC } from 'react'
export interface TestListProps {
  activeTest: string
  tests: TestShape[]
}

const { state: { setActiveTest } } = sideAPI

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
