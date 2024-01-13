import { styled } from '@mui/material'
import React, { HTMLAttributes } from 'react'

const MainCore: React.FC<HTMLAttributes<HTMLDivElement>> = styled('div')(({ theme }) => ({
  flexDirection: 'column',
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}))

export default MainCore
