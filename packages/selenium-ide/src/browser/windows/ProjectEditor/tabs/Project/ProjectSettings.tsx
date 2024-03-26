import CloseIcon from '@mui/icons-material/Close'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import EditorToolbar from 'browser/components/Drawer/EditorToolbar'
import TextField from 'browser/components/UncontrolledTextField'
import { context } from 'browser/contexts/config'
import React, { FC } from 'react'

export interface MiniProjectShape {
  id: string
  name: string
}

const {
  plugins: { projectCreate, projectDelete, projectEdit },
  projects: { update },
} = window.sideAPI
const ProjectSettings: FC = () => {
  const {
    project: { delay, name, plugins, url },
  } = React.useContext(context)
  if (url === 'http://loading') {
    return null
  }
  return (
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
            value={name}
          />
        </FormControl>
        <FormControl>
          <TextField
            id="project-url"
            label="Project URL"
            name="project-url"
            onChange={(e: any) => {
              update({
                url: e.target.value,
              })
            }}
            size="small"
            value={url}
          />
        </FormControl>
        <FormControl>
          <TextField
            id="delay"
            label="Step Delay (MILLISECONDS)"
            helperText="Each step will pause by this setting"
            name="delay"
            type="number"
            inputProps={{ min: 0, step: 1000 }}
            onChange={(e: any) => {
              update({
                delay: Math.max(parseInt(e.target.value || '0'), 0),
              })
            }}
            size="small"
            value={delay || 0}
          />
        </FormControl>
      </Stack>
      <List
        dense
        subheader={
          <EditorToolbar onAdd={() => projectCreate()} addText="Add Plugin">
            <span className="ps-4">Project Plugins</span>
          </EditorToolbar>
        }
        sx={{
          borderColor: 'primary.main',
        }}
      >
        {plugins.map((plugin, index) => (
          <ListItem className="py-3" key={index}>
            <TextField
              value={typeof plugin === 'string' ? plugin : ''}
              id={`plugin-${index}`}
              fullWidth
              onBlur={(e) => projectEdit(index, e.target.value)}
              size="small"
            />
            <IconButton className="ms-4" onClick={() => projectDelete(index)}>
              <CloseIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default ProjectSettings
