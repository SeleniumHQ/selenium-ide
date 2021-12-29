import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemButton from '@material-ui/core/ListItemButton'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import React, { FC } from 'react'
import { TestShape } from 'api/types'
import { LoadedWindow } from 'browser/types'

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
  <List
    className="overflow-y pt-0 fill br"
    dense
    sx={{ borderColor: 'primary.main' }}
    subheader={<ListSubheader className="lh-36">Tests</ListSubheader>}
  >
    {tests.map((test) => {
      const id = test.id
      return (
        <ListItem disablePadding key={id} onClick={() => setActiveTest(id)}>
          <ListItemButton disableRipple selected={id === activeTest}>
            <ListItemText>{test.name}</ListItemText>
          </ListItemButton>
        </ListItem>
      )
    })}
  </List>
)

export default TestList
