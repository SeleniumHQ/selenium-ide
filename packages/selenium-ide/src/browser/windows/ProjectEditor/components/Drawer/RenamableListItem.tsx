import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import React, { FC } from 'react'

export interface TestListProps {
  id: string
  name: string
  rename: (id: string, name: string) => void
  selected: boolean
  setSelected: (id: string) => void
}

const RenamableListItem: FC<TestListProps> = ({
  id,
  name,
  rename,
  selected,
  setSelected,
}) => {
  const [renaming, setRenaming] = React.useState(false)
  return (
    <ListItem
      disablePadding
      key={id}
      onClick={() => setSelected(id)}
      onDoubleClick={() => setRenaming(true)}
    >
      {renaming ? (
        <TextField
          autoFocus
          defaultValue={name}
          onBlur={(e) => {
            setRenaming(false)
            rename(id, e.target.value)
          }}
          onKeyDown={(e) => {
            if (['Enter', 'Escape', 'Tab'].includes(e.code)) {
              const el = document.activeElement as HTMLElement
              el.blur()
            }
          }}
          size="small"
        />
      ) : (
        <ListItemButton disableRipple selected={selected}>
          <ListItemText>{name}</ListItemText>
        </ListItemButton>
      )}
    </ListItem>
  )
}

export default RenamableListItem
