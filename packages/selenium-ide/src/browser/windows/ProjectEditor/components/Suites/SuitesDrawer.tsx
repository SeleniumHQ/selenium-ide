import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import { SuiteShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'

export interface SuiteListProps {
  activeSuite: string
  suites: SuiteShape[]
}

const { state: { setActiveSuite } } = window.sideAPI

const SuiteList: FC<SuiteListProps> = ({ activeSuite, suites }) => (
  <List
    dense
    sx={{ borderColor: 'primary.main' }}
    subheader={<ListSubheader className="lh-36">Suites</ListSubheader>}
  >
    {suites.map(({ id, name }) => (
      <ListItem disablePadding key={id} onClick={() => setActiveSuite(id)}>
        <ListItemButton disableRipple selected={id === activeSuite}>
          <ListItemText>{name}</ListItemText>
        </ListItemButton>
      </ListItem>
    ))}
  </List>
)

export default SuiteList
