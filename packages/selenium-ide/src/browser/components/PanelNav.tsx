import React from 'react'
import { Paper } from '@material-ui/core'

interface PanelNavProps {
  vertical?: boolean
}

const PanelNav: React.FC<PanelNavProps> = ({ children, vertical }) => (
  <Paper
    className={vertical ? 'draggable panel-v-nav' : 'draggable panel-nav'}
    square
    variant="outlined"
  >
    <Paper className='fill' elevation={4} square>
      {children}
    </Paper>
  </Paper>
)

export default PanelNav
