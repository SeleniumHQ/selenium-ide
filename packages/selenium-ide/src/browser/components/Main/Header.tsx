import Box, {BoxProps} from '@mui/material/Box'
import { styled } from '@mui/material/styles'

const MainHeader: React.FC<BoxProps> = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  // necessary for content to be below app bar
  height: '48px !important',
  minHeight: '48px !important',
  position: 'sticky',
  top: 0,
  zIndex: 100,
}))

export default MainHeader
