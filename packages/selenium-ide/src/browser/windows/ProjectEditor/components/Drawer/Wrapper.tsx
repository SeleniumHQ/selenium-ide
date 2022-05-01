import Divider from '@mui/material/Divider'
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import React from 'react'
import DrawerWrapperHeader from './Header'
import { useHeightFromElement } from 'browser/helpers/useHeightFromElement'

export const drawerWidth = 160

export const drawerStyle = (footerHeight: number) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    height: `calc(100% - ${footerHeight}px)`,
    width: drawerWidth,
  },
})

export interface DrawerWrapperProps extends DrawerProps {
  footerID: string
  header: React.ReactNode
  open: boolean
  setOpen: (b: boolean) => void
}

const DrawerWrapper: React.FC<DrawerWrapperProps> = ({
  children,
  footerID,
  header = null,
  open,
  setOpen,
}) => {
  const footerHeight = useHeightFromElement(footerID)
  return (
    <MuiDrawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={drawerStyle(footerHeight)}
    >
      <DrawerWrapperHeader>
        <IconButton onClick={() => setOpen(false)}>
          <ChevronLeft />
        </IconButton>
        <span className="flex flex-1">{header}</span>
      </DrawerWrapperHeader>
      <Divider sx={{ position: 'sticky', top: '46px' }} />
      {children}
    </MuiDrawer>
  )
}

export default DrawerWrapper
