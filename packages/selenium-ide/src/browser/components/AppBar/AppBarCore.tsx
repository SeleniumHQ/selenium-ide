import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'

const AppBarCore: React.FC<BoxProps> = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}))

export default AppBarCore
