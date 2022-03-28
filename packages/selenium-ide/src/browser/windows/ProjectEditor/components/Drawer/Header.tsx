import { styled } from '@mui/material/styles'

const DrawerHeader = styled('div')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  borderBottom: '1px solid',
  borderColor: theme.palette.action.focus,
  display: 'flex',
  // necessary for content to be below app bar
  height: '47px !important',
  justifyContent: 'flex-end',
  minHeight: '47px !important',
  position: 'sticky',
  top: 0,
  zIndex: 100,
}))

export default DrawerHeader
