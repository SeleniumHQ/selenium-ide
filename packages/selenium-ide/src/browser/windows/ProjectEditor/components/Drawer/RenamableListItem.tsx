import ListItem, { ListItemProps } from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import { CommandState } from '@seleniumhq/side-runtime'
import React, { FC } from 'react'
import CommandOverlay from '../../tabs/Tests/TestCommandOverlay'

export interface TestListProps {
  id: string
  name: string
  rename: (id: string, name: string) => void
  selected: boolean
  setSelected: (id: string) => void
  state?: CommandState
}

const RenamableListItem: FC<ListItemProps & TestListProps> = ({
  id,
  name,
  rename,
  selected,
  setSelected,
  state = null,
  ...props
}) => {
  const [renaming, setRenaming] = React.useState(false)
  return (
    <ListItem
      disablePadding
      key={id}
      onClick={() => setSelected(id)}
      onDoubleClick={() => setRenaming(true)}
      {...props}
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
          <CommandOverlay state={state} />
        </ListItemButton>
      )}
    </ListItem>
  )
}

export default RenamableListItem
