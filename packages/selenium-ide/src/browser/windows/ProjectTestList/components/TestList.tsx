import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemButton from '@material-ui/core/ListItemButton'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import { TestShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import { LoadedWindow } from 'browser/types'
import { Paper } from '@material-ui/core'

export interface TestListProps {
  activeTest: string
  tests: TestShape[]
}

const {
  sideAPI: {
    state: { setActiveTest },
  },
} = window as LoadedWindow

const TestList: FC<TestListProps> = ({ activeTest, tests }) => (
  <Paper className="outside-nav" square>
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
  </Paper>
)

export default TestList
