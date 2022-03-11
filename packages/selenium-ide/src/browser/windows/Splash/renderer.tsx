import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import AppWrapper from 'browser/components/AppWrapper'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

const ProjectEditor = () => {
  const [recentProjects, setRecentProjects] = useState<string[]>([])
  useEffect(() => {
    window.sideAPI.projects.getRecent().then(setRecentProjects)
  }, [])
  const loadProject = async () => {
    const response = await window.sideAPI.dialogs.open()
    if (response.canceled) return
    await window.sideAPI.projects.load(response.filePaths[0])
  }
  const newProject = async () => {
    await window.sideAPI.projects.new()
  }

  return (
    <AppWrapper>
      <Grid className="centered pt-4" container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">Welcome to Selenium IDE v4</Typography>
          <Typography variant="subtitle1">
            Please load a project or create a new one
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Button onClick={loadProject} variant="contained">
            Load Project
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button onClick={newProject} variant="outlined">
            New Project
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Recent Projects:</Typography>
          <List dense>
            {recentProjects.map((filepath, index) => (
              <ListItem
                disablePadding
                key={index}
                onClick={() => window.sideAPI.projects.load(filepath)}
              >
                <ListItemButton>
                  <ListItemText primary={filepath} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')

ReactDOM.render(React.createElement(ProjectEditor), domContainer)
