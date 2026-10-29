import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import AppWrapper from 'browser/components/AppWrapper'
import React, { useEffect, useState } from 'react'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import languageMap from 'browser/I18N/keys'
import { FormattedMessage } from 'react-intl'

const ProjectEditor = () => {
  const [logPath, setLogPath] = useState<string>('...')
  const [recentProjects, setRecentProjects] = useState<string[]>([])

  useEffect(() => {
    window.sideAPI.system.getLogPath().then(setLogPath)
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
          <Typography variant="h4">
            <FormattedMessage id={languageMap.splash.present} />
          </Typography>
          <Typography variant="caption">
            <FormattedMessage id={languageMap.splash.logPath} /> "{logPath}"
          </Typography>
          <Typography variant="subtitle1">
            <FormattedMessage id={languageMap.splash.openNotice} />
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Button data-load-project onClick={loadProject} variant="contained">
            <FormattedMessage id={languageMap.splash.loadProject} />
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button data-new-project onClick={newProject} variant="outlined">
            <FormattedMessage id={languageMap.splash.createProject} />
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">
            <FormattedMessage id={languageMap.splash.openRecent} />
          </Typography>
          <List dense>
            {recentProjects.map((filepath, index) => (
              <ListItem
                disablePadding
                key={index}
                onClick={() => {
                  window.sideAPI.projects.load(filepath).then(() => {
                    window.sideAPI.projects.getRecent().then(setRecentProjects)
                  })
                }}
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

renderWhenReady(ProjectEditor)
