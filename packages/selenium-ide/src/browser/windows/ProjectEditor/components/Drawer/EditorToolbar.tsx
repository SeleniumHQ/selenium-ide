import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import RemoveIcon from '@mui/icons-material/Remove'
import IconButton from '@mui/material/IconButton'
import ListSubheader, { ListSubheaderProps } from '@mui/material/ListSubheader'
import React, { FC } from 'react'

interface EditorToolbarProps extends ListSubheaderProps {
  onAdd?: () => void
  onEdit?: () => void
  onRemove?: () => void
  text?: string
}

const standardIconProps = {
  className: 'mx-2',
  disableRipple: true,
  size: 'small',
  sx: { float: 'right' },
} as const

const EditorToolbar: FC<EditorToolbarProps> = ({
  className = "lh-36",
  onAdd,
  onEdit,
  onRemove,
  sx = {},
  text = null,
  ...props
}) => (
  <ListSubheader
    className={className}
    disableGutters
    sx={{ zIndex: 100, ...sx }}
    {...props}
  >
    {text}
    {onAdd ? (
      <IconButton {...standardIconProps} color="success" onClick={onAdd}>
        <AddIcon />
      </IconButton>
    ) : null}
    {onEdit ? (
      <IconButton {...standardIconProps} color="info" onClick={onEdit}>
        <EditIcon />
      </IconButton>
    ) : null}
    {onRemove ? (
      <IconButton {...standardIconProps} color="warning" onClick={onRemove}>
        <RemoveIcon />
      </IconButton>
    ) : null}
  </ListSubheader>
)

export default EditorToolbar
