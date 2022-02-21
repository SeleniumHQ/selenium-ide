import React from 'react'
import { Paper } from '@material-ui/core'

interface PanelNavProps {
  horizontal?: boolean
}

export const NavSize = 14

const PanelNav: React.FC<PanelNavProps> = ({ children, horizontal }) => (
  <Paper
    className={horizontal ? 'draggable panel-v-nav my-1' : 'draggable panel-nav mx-1'}
    square
    variant="outlined"
  >
    <Paper className='fill' elevation={16} square>
      {children}
    </Paper>
  </Paper>
)

export default PanelNav
