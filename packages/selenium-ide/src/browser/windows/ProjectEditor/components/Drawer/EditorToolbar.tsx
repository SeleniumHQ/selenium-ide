import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import RemoveIcon from '@mui/icons-material/Remove'
import { Box, Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import ListSubheader, { ListSubheaderProps } from '@mui/material/ListSubheader'
import React, { FC } from 'react'

interface EditorToolbarProps extends ListSubheaderProps {
  onAdd?: () => void
  onEdit?: () => void
  onRemove?: () => void
  onView?: () => void
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
  onView,
  sx = {},
  ...props
}) => (
  <ListSubheader
    className={className}
    disableGutters
    sx={{ zIndex: 100, display: 'flex', flexDirection: 'row', ...sx }}
    {...props}
  >
    <Box sx={{ flex: 1 }}>{children}</Box>
    {onAdd ? (
      <Box sx={{ flex: 0 }}>
        <Tooltip title="Add">
          <IconButton {...standardIconProps} color="success" onClick={onAdd}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null}
    {onRemove ? (
      <Box sx={{ flex: 0 }}>
        <Tooltip title="Remove">
          <IconButton {...standardIconProps} color="warning" onClick={onRemove}>
            <RemoveIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null}
    {onEdit ? (
      <Box sx={{ flex: 0 }}>
        <Tooltip title="Edit">
          <IconButton {...standardIconProps} color="info" onClick={onEdit}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null}
    {onView ? (
      <Box sx={{ flex: 0 }}>
        <Tooltip title="View Playback Results">
          <IconButton {...standardIconProps} color="info" onClick={onView}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null}
  </ListSubheader>
)

export default EditorToolbar
