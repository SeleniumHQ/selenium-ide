import { styled } from '@mui/material'

const mainProps = ['hasDrawer', 'openDrawer']
const MainCore = styled('main', {
  shouldForwardProp: (prop) => !mainProps.includes(prop as string),
})<{
  hasDrawer?: boolean
  openDrawer?: boolean
}>(({ theme, hasDrawer, openDrawer }) => ({
  flexDirection: 'column',
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: hasDrawer ? '-160px' : 0,
  ...(hasDrawer && openDrawer && {
    marginLeft: 0,
    maxWidth: 'calc(100% - 160px)',
  }),
}))

export default MainCore
