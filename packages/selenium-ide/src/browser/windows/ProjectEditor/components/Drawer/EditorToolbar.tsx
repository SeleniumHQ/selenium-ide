import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import RemoveIcon from '@mui/icons-material/Remove'
import Box from '@mui/material/Box'
import {PaperProps} from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import React, { FC } from 'react'
import DrawerHeader from './Header'
import baseControlProps from '../Controls/BaseProps'

export interface EditorToolbarIconsProps {
  disabled?: boolean
  onAdd?: () => void
  onEdit?: () => void
  onRemove?: () => void
  onView?: () => void
}

export const EditorToolbarIcons: FC<EditorToolbarIconsProps> = ({
  disabled = false,
  onAdd,
  onEdit,
  onRemove,
  onView,
}) => (
  <>
    {onAdd ? (
      <Box sx={{ flex: 0 }}>
        <Tooltip title="Add">
          <IconButton
            {...baseControlProps}
            color="success"
            disabled={disabled}
            onClick={onAdd}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null}
    {onRemove ? (
      <Box sx={{ flex: 0 }}>
        <Tooltip title="Remove">
          <IconButton
            {...baseControlProps}
            color="warning"
            disabled={disabled}
            onClick={onRemove}
          >
            <RemoveIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null}
    {onEdit ? (
      <Box sx={{ flex: 0 }}>
        <Tooltip title="Edit">
          <IconButton
            {...baseControlProps}
            color="info"
            disabled={disabled}
            onClick={onEdit}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null}
    {onView ? (
      <Box sx={{ flex: 0 }}>
        <Tooltip title="View Playback Results">
          <IconButton
            {...baseControlProps}
            color="info"
            disabled={disabled}
            onClick={onView}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null}
  </>
)

export const EditorToolbarShell: FC<PaperProps> = ({
  children,
  className = '',
  elevation = 7,
  ...props
}) => (
  <DrawerHeader
    className={className + ' flex flex-row'}
    elevation={elevation}
    square
    {...props}
  >
    <Box sx={{ flex: 1 }}>{children}</Box>
  </DrawerHeader>
)

export interface EditorToolbarProps extends PaperProps, EditorToolbarIconsProps {}

const EditorToolbar: FC<EditorToolbarProps> = ({
  children,
  className = '',
  disabled = false,
  elevation = 7,
  onAdd,
  onEdit,
  onRemove,
  onView,
  ...props
}) => (
  <DrawerHeader
    className={className + ' flex flex-row'}
    elevation={elevation}
    square
    {...props}
  >
    <Box sx={{ flex: 1 }}>{children}</Box>
    <EditorToolbarIcons
      disabled={disabled}
      onAdd={onAdd}
      onEdit={onEdit}
      onRemove={onRemove}
      onView={onView}
    />
  </DrawerHeader>
)

export default EditorToolbar
