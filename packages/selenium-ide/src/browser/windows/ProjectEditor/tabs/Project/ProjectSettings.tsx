import CloseIcon from '@mui/icons-material/Close'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import { CoreSessionData } from '@seleniumhq/side-api'
import TextField from 'browser/components/UncontrolledTextField'
import React, { FC } from 'react'
import EditorToolbar from '../../components/Drawer/EditorToolbar'

export interface ProjectSettingsProps {
  project: CoreSessionData['project']
}

export interface MiniProjectShape {
  id: string
  name: string
}

const {
  plugins: { projectCreate, projectDelete, projectEdit },
  projects: { update },
} = window.sideAPI
const ProjectSettings: FC<ProjectSettingsProps> = ({
  project,
}) => (
  <>
    <Stack className="p-4" spacing={1}>
      <FormControl>
        <TextField
          id="name"
          label="Name"
          name="name"
          onChange={(e: any) => {
            update({
              name: e.target.value,
            })
          }}
          size="small"
          value={project.name}
        />
      </FormControl>
      <FormControl>
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
          value={project.url}
        />
      </FormControl>
    </Stack>
    <List
      dense
      subheader={
        <EditorToolbar
          disableGutters={false}
          sx={{ top: '48px', zIndex: 100 }}
          onAdd={() => projectCreate()}
        >
          Project Plugins
        </EditorToolbar>
      }
      sx={{
        borderColor: 'primary.main',
      }}
    >
      {project.plugins.map((plugin, index) => (
        <ListItem className="py-3" key={index}>
          <TextField
            value={typeof plugin === 'string' ? plugin : ''}
            id={`plugin-${index}`}
            fullWidth
            onBlur={(e) => projectEdit(index, e.target.value)}
            size="small"
          />
          <IconButton className="ml-4" onClick={() => projectDelete(index)}>
            <CloseIcon />
          </IconButton>
        </ListItem>
      ))}
    </List>
  </>
)

export default ProjectSettings
