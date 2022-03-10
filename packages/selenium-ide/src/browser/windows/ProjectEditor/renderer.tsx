import MuiAppBar, { AppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
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
import Main from './components/Main'

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

interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  }
}

const ProjectTestCommandList = () => {
  const session = subscribeToSession()
  const {
    project: { id, tests },
    state: { activeTestID },
  } = session

  const [open, setOpen] = React.useState(false)
  const handleDrawerOpen = () => setOpen(true)
  const handleDrawerClose = () => setOpen(false)

  const [value, setValue] = React.useState(0)
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(parseInt(newValue))
  }
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
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="Selenium IDE workflows"
          >
            <Tab label="Test" {...a11yProps(0)} />
            <Tab label="Suites" {...a11yProps(1)} />
            <Tab label="Config" {...a11yProps(2)} />
          </Tabs>
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
        <Main className="fill" open={open}>
          <TabPanel index={0} value={value}>
            <CommandTab open={open} session={session} />
          </TabPanel>
          <TabPanel index={1} value={value}>
            Item Two
          </TabPanel>
          <TabPanel index={2} value={value}>
            Item Three
          </TabPanel>
        </Main>
      </Box>
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectTestCommandList), domContainer)
