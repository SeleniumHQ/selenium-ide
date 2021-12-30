import { SuiteShape } from '@seleniumhq/side-model'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemButton from '@material-ui/core/ListItemButton'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import React, { FC } from 'react'
import { LoadedWindow } from 'browser/types'

export interface SuiteListProps {
  activeSuite: string
  Suites: SuiteShape[]
}

const {
  sideAPI: {
    state: { setActiveSuite },
  },
} = window as LoadedWindow

const SuiteList: FC<SuiteListProps> = ({ activeSuite, Suites }) => (
  <List
    className="overflow-y pt-0 fill br"
    dense
    sx={{ borderColor: 'primary.main' }}
    subheader={<ListSubheader className="lh-36">Suites</ListSubheader>}
  >
    {Suites.map((Suite) => {
      const id = Suite.id
      return (
        <ListItem disablePadding key={id} onClick={() => setActiveSuite(id)}>
          <ListItemButton disableRipple selected={id === activeSuite}>
            <ListItemText>{Suite.name}</ListItemText>
          </ListItemButton>
        </ListItem>
      )
    })}
  </List>
)

export default SuiteList
