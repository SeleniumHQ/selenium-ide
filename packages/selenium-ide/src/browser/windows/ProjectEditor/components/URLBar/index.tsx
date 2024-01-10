import FormControl from '@mui/material/FormControl'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import React from 'react'
import { SIDEMainProps } from '../types'

const {
  projects: { update },
} = window.sideAPI

const URLBar: React.FC<Pick<SIDEMainProps, 'session'>> = ({ session }) => {
  return (
    <Paper className="flex-initial pb-0 p-3" elevation={7} square>
      <FormControl fullWidth size="small">
        <TextField
          id="url"
          label="URL"
          name="url"
          onChange={(e: any) => {
            update({
              url: e.target.value,
            })
          }}
          size="small"
          value={session.project.url}
        />
      </FormControl>
    </Paper>
  )
}

export default URLBar
