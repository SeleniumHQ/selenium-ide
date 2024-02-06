import Divider from '@mui/material/Divider'
import Box, { BoxProps } from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import React from 'react'

export interface DrawerWrapperProps extends BoxProps {
  header?: React.ReactNode
}

const DrawerWrapper: React.FC<DrawerWrapperProps> = ({
  children,
  className = '',
  header = null,
}) => (
  <Box className={'flex fill flex-col' + (className ? ` ${className}` : '')}>
    {header && (
      <>
        <Paper
          className="flex-initial no-overflow-x px-4 py-3-375 z-2"
          elevation={2}
          square
          sx={{
            borderColor: 'warning.main',
            borderBottomWidth: 2,
            borderBottomStyle: 'solid',
            justifyContent: 'center',
            textAlign: 'center',
            textOverflow: 'ellipsis',
          }}
        >
          <Typography variant="button" textOverflow="ellipsis">
            {header}
          </Typography>
        </Paper>
        <Divider className="flex-initial" />
      </>
    )}
    {children}
  </Box>
)

export default DrawerWrapper
