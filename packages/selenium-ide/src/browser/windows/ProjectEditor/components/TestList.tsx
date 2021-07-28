import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemButton from '@material-ui/core/ListItemButton'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import React, { Dispatch, FC, SetStateAction } from 'react'

export interface TestListProps {
  activeTest: string
  setActiveTest: Dispatch<SetStateAction<string>>
  tests: TestShape[]
}

const TestList: FC<TestListProps> = ({ activeTest, setActiveTest, tests }) => (
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
