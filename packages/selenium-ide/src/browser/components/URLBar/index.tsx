import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React from 'react'
import { SIDEMainProps } from '../types'

const {
  projects: { update },
} = window.sideAPI

const URLBar: React.FC<Pick<SIDEMainProps, 'session'>> = ({ session }) => {
  return (
    <>
      <Box className="flex flex-col flex-initial ps-4" justifyContent="center">
        <Typography>URL</Typography>
      </Box>
      <Box className="flex-1 px-3 py-2">
        <TextField
          className="width-100"
          inputProps={{
            ['data-url']: true,
          }}
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
    </>
  )
}

export default URLBar
