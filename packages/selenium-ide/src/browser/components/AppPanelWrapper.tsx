import { Paper } from '@mui/material'
import React, { FC } from 'react'
import AppWrapper from './AppWrapper'
import PanelNav from './PanelNav'

interface AppPanelWrapperProps {
  horizontal?: boolean
}

const AppPanelWrapper: FC<AppPanelWrapperProps> = ({
  children,
  horizontal,
}) => {
  const navClassName = React.useMemo(
    () => `fill ${horizontal ? 'outside-v-nav' : 'outside-nav'}`,
    [horizontal]
  )
  return (
    <AppWrapper>
      <PanelNav horizontal={horizontal} />
      <Paper className={navClassName} square>
        {children}
      </Paper>
    </AppWrapper>
  )
}

export default AppPanelWrapper
