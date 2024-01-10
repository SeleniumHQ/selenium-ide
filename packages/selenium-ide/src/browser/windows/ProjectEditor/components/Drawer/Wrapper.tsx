import Divider from '@mui/material/Divider'
import Box, { BoxProps } from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import React from 'react'
import DrawerWrapperHeader from './Header'
import baseControlProps from '../Controls/BaseProps'

export const drawerWidth = 160

export const drawerStyle = (open: boolean) => ({
  width: open ? drawerWidth : 0,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    height: '100%',
    width: '100%'
  },
})

export interface DrawerWrapperProps extends BoxProps {
  header: React.ReactNode
  open: boolean
  setOpen: (b: boolean) => void
}

const DrawerWrapper: React.FC<DrawerWrapperProps> = ({
  children,
  className,
  header = null,
  open,
  setOpen,
}) => (
  <Box className={className + ' flex no-overflow-x'} sx={drawerStyle(open)}>
    <DrawerWrapperHeader className='flex-initial flex-row' elevation={7} square>
      <IconButton {...baseControlProps} onClick={() => setOpen(false)}>
        <ChevronLeft />
      </IconButton>
      <span className="flex flex-1">{header}</span>
    </DrawerWrapperHeader>
    <Divider className='flex-initial' />
    {children}
  </Box>
)

export default DrawerWrapper
