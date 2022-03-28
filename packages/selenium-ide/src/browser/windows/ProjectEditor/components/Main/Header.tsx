import { styled } from '@mui/material/styles'

const MainHeader = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
  // necessary for content to be below app bar
  height: '96px !important',
  minHeight: '96px !important',
  position: 'sticky',
  top: 0,
  zIndex: 100,
}))

export default MainHeader
