import MuiAppBar, { AppBarProps } from '@mui/material/AppBar'
import { styled } from '@mui/material/styles'
import { drawerWidth } from '../Drawer/Wrapper'

const AppBarCore = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'openDrawer',
})<AppBarProps & { openDrawer: boolean }>(({ theme, openDrawer }) => ({
  display: 'flex',
  flexDirection: 'row',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(openDrawer && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

export default AppBarCore
