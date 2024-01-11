import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React from 'react'
import { SIDEMainProps } from '../types'

const {
  projects: { update },
} = window.sideAPI

const URLBar: React.FC<Pick<SIDEMainProps, 'session'>> = ({ session }) => {
  return (
    <Paper className="flex flex-initial flex-row px-3 py-2" elevation={15} square>
      <Box className="flex flex-col flex-initial ps-4" justifyContent="center">
        <Typography>URL</Typography>
      </Box>
      <Box className="flex-1 px-4">
        <TextField
          className="width-100"
          onChange={(e: any) => {
            update({
              url: e.target.value,
            })
          }}
          margin="none"
          size="small"
          value={session.project.url}
        />
      </Box>
    </Paper>
  )
}

export default URLBar
