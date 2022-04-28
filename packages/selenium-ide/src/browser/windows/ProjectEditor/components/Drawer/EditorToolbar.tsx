import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import RemoveIcon from '@mui/icons-material/Remove'
import { Box } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import ListSubheader, { ListSubheaderProps } from '@mui/material/ListSubheader'
import React, { FC } from 'react'

interface EditorToolbarProps extends ListSubheaderProps {
  onAdd?: () => void
  onEdit?: () => void
  onRemove?: () => void
}

const standardIconProps = {
  className: 'mx-2',
  disableRipple: true,
  size: 'small',
  sx: { float: 'right' },
} as const

const EditorToolbar: FC<EditorToolbarProps> = ({
  children,
  className = 'lh-36',
  onAdd,
  onEdit,
  onRemove,
  sx = {},
  ...props
}) => (
  <ListSubheader
    className={className}
    disableGutters
    sx={{ zIndex: 100, display: 'flex', flexDirection: 'row', ...sx }}
    {...props}
  >
    <Box sx={{ flex: 1 }}>
      {children}
    </Box>
    <Box sx={{ flex: 0 }}>
      {onAdd ? (
        <IconButton {...standardIconProps} color="success" onClick={onAdd}>
          <AddIcon />
        </IconButton>
      ) : null}
    </Box>
    <Box sx={{ flex: 0 }}>
      {onEdit ? (
        <IconButton {...standardIconProps} color="info" onClick={onEdit}>
          <EditIcon />
        </IconButton>
      ) : null}
    </Box>
    <Box sx={{ flex: 0 }}>
      {onRemove ? (
        <IconButton {...standardIconProps} color="warning" onClick={onRemove}>
          <RemoveIcon />
        </IconButton>
      ) : null}
    </Box>
  </ListSubheader>
)

export default EditorToolbar
