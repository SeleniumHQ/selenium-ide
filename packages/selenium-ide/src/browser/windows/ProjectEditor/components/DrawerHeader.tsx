import { styled } from '@mui/material/styles'

// @ts-expect-error
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  height: '47px !important',
  minHeight: '47px !important',
  justifyContent: 'flex-end',
}))

export default DrawerHeader
