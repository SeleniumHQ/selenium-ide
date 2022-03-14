import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import React, { FC } from 'react'
import { CoreSessionData } from 'api/types'
import DrawerHeader from '../Drawer/Header'
import { Paper } from '@mui/material'
import { drawerWidth } from '../Drawer'

export interface ProjectTabProps {
  open: boolean
  session: CoreSessionData
}

export interface MiniProjectShape {
  id: string
  name: string
}

const ProjectTab: FC<ProjectTabProps> = ({ open, session: { project } }) => (
  <Paper
    elevation={1}
    id="project-editor"
    square
    sx={{
      position: 'fixed',
      top: 0,
      left: open ? drawerWidth : 0,
      right: 0,
    }}
  >
    <DrawerHeader />
    <DrawerHeader />
    <Stack className="p-4" spacing={1}>
      <FormControl>
        <TextField
          label="Name"
          name="name"
          onChange={(e: any) => {
            window.sideAPI.projects.update({
              name: e.target.value,
            })
          }}
          size="small"
          value={project.name}
        />
      </FormControl>
      <FormControl>
        <TextField
          label="URL"
          name="url"
          onChange={(e: any) => {
            window.sideAPI.projects.update({
              url: e.target.value,
            })
          }}
          size="small"
          value={project.url}
        />
      </FormControl>
    </Stack>
  </Paper>
)

export default ProjectTab
