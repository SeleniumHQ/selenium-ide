import Paper, {PaperProps} from '@mui/material/Paper'
import { styled } from '@mui/material/styles'

const DrawerHeader: React.FC<PaperProps> = styled(Paper)(
  ({ theme }) => ({
    alignItems: 'center',
    borderColor: theme.palette.action.focus,
    // necessary for content to be below app bar
    justifyContent: 'flex-end',
    textOverflow: 'ellipsis',
  })
)

export default DrawerHeader
