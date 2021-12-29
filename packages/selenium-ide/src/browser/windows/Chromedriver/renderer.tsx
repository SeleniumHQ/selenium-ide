import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { LoadedWindow } from 'browser/types'
// import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import AppWrapper from 'browser/components/AppWrapper'

const { sideAPI } = window as LoadedWindow

const activateChromedriver = async (setDriverStatus: (val: string) => void) => {
  const path = await sideAPI.driver.getBrowserPath()
  setDriverStatus(`Checking browser version at ${path}`)
  const version = await sideAPI.driver.getBrowserVersion()
  setDriverStatus(`Downloading driver for version ${version} if not found`)
  await sideAPI.driver.download(version)
  setDriverStatus(`Driver is downloaded, starting driver`)
  await sideAPI.driver.startProcess(version)
  await sideAPI.windows.open('splash')
  await sideAPI.windows.close('chromedriver')
}

const ProjectEditor = () => {
  const [driverStatus, setDriverStatus] = useState<string>(
    'Obtaining driver info'
  )
  useEffect(() => {
    activateChromedriver(setDriverStatus)
  }, [])

  return (
    <AppWrapper>
      <Grid className="centered pt-4" container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">Initializing Selenium IDE v4</Typography>
          <Typography variant="subtitle1">{driverStatus}</Typography>
        </Grid>
      </Grid>
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectEditor), domContainer)
