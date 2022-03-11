import Divider from '@mui/material/Divider'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import React from 'react'
import DrawerHeader from './Header'

export const drawerWidth = 160

export const drawerStyle = {
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
}

interface DrawerProps {
  open: boolean
  setOpen: (b: boolean) => void
}

const Drawer: React.FC<DrawerProps> = ({ children, open, setOpen }) => (
  <MuiDrawer variant="persistent" anchor="left" open={open} sx={drawerStyle}>
    <DrawerHeader>
      <IconButton onClick={() => setOpen(false)}>
        <ChevronLeft />
      </IconButton>
    </DrawerHeader>
    <Divider />
    {children}
  </MuiDrawer>
)

export default Drawer
