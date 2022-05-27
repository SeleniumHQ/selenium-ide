import CloseIcon from '@mui/icons-material/Close'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { CoreSessionData } from 'api/types'
import TextField from 'browser/components/UncontrolledTextField'
import React, { FC } from 'react'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import MainHeader from '../../components/Main/Header'

export interface ProjectTabProps {
  session: CoreSessionData
}

export interface MiniProjectShape {
  id: string
  name: string
}

const {
  plugins: { projectCreate, projectDelete, projectEdit },
  projects: { update },
} = window.sideAPI
const ProjectTab: FC<ProjectTabProps> = ({ session: { project, state } }) => (
  <>
    <MainHeader />
    <Paper elevation={1} id="project-editor" square>
      <Stack className="p-4" spacing={1}>
        <FormControl>
          <TextField value={state.userPrefs.insertCommandPref}>
          </TextField>
        </FormControl>
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
        <FormControl>
          <InputLabel id="insertNewCommandPref">
            New command insert preference
          </InputLabel>
          <Select
            id="insertNewCommandPref"
            label="Insert new command placement preference"
            name="insertNewCommandPref"
            value={state.userPrefs.insertCommandPref}
            onChange={(e: any) => {
              window.sideAPI.state.toggleUserPrefInsert(e.target.value)
            }}
          >
            <MenuItem value="After">After</MenuItem>
            <MenuItem value="Before">Before</MenuItem>
          </Select>
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
              defaultValue={typeof plugin === 'string' ? plugin : ''}
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
    </Paper>
  </>
)

export default ProjectTab
