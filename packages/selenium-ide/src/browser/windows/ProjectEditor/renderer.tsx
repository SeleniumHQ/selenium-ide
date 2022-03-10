import {
  AppBar as MuiAppBar,
  AppBarProps,
  Box,
  Divider,
  Drawer,
  IconButton,
  styled,
  Toolbar,
  Typography,
} from '@mui/material'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import loadingID from 'api/constants/loadingID'
import AppWrapper from 'browser/components/AppWrapper'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import ReactDOM from 'react-dom'
import TestList from './components/Tests/TestList'
import CommandTab from './components/Commands/CommandTab'
import { drawerStyle } from './components/Drawer'
import DrawerHeader from './components/DrawerHeader'

const drawerWidth = 160

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps & { open: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const ProjectTestCommandList = () => {
  const session = subscribeToSession()
  const {
    project: { id, tests },
    state: { activeTestID },
  } = session

  const [open, setOpen] = React.useState(false)
  const handleDrawerOpen = () => setOpen(true)
  const handleDrawerClose = () => setOpen(false)
  if (id == loadingID) {
    return null
  }
  return (
    <AppWrapper>
      <Box sx={{ display: 'flex' }}>
        <AppBar className="draggable" position="fixed" open={open}>
          <Toolbar className="" variant="dense">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Selenium IDE
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="persistent" anchor="left" open={open} sx={drawerStyle}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeft />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <TestList activeTest={activeTestID} tests={tests} />
        </Drawer>
        <CommandTab open={open} session={session} />
      </Box>
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectTestCommandList), domContainer)
