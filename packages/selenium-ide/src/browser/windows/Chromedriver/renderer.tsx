import { Grid, MenuItem, Select, Typography } from '@material-ui/core'
import { Browser } from '@seleniumhq/get-driver'
import AppWrapper from 'browser/components/AppWrapper'
import { LoadedWindow } from 'browser/types'
import { BrowserInfo, BrowsersInfo } from 'main/types'
import React, { ChangeEvent, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

const { sideAPI } = window as LoadedWindow

const driverStates = {
  LIST_BROWSERS: 'Obtaining local browsers list...',
  SELECT_BROWSER: 'Please select a browser to obtain driver bindings for',
  SELECTED_BROWSER: 'Updating chosen browser...',
  DOWNLOADING_DRIVER: 'Downloading driver...',
  STARTING_DRIVER: 'Driver is downloaded, starting driver...',
  COMPLETE: 'Driver is started, starting app...',
}
type DriverStates = typeof driverStates
type DriverStateKeys = keyof DriverStates
const driverStateKeys = Object.fromEntries(
  Object.keys(driverStates).map((key) => [key, key])
) as Record<DriverStateKeys, DriverStateKeys>

const browserToString = (browser: BrowserInfo): string =>
  `chrome|${browser.version}`
const browserFromString = (browserString: string): BrowserInfo => {
  const [browser, version] = browserString.split('|')
  return { browser: browser as Browser, version }
}

const ProjectEditor = () => {
  const [browserInfo, setBrowserInfo] = useState<BrowsersInfo>({
    browsers: [],
    selected: { browser: 'chrome', version: '' },
  })
  const [driverStatus, setDriverStatus] =
    useState<keyof typeof driverStates>('LIST_BROWSERS')

  useEffect(() => {
    switch (driverStatus) {
      case driverStateKeys.LIST_BROWSERS:
        sideAPI.driver.listBrowsers().then(async (info) => {
          setBrowserInfo(info)
          if (info.selected.version) {
            setDriverStatus(driverStateKeys.DOWNLOADING_DRIVER)
          } else {
            setDriverStatus(driverStateKeys.SELECT_BROWSER)
          }
        })
        break
      case driverStateKeys.SELECTED_BROWSER:
        sideAPI.driver.selectBrowser(browserInfo.selected).then(() => {
          setDriverStatus(driverStateKeys.DOWNLOADING_DRIVER)
        })
        break
      case driverStateKeys.DOWNLOADING_DRIVER:
        sideAPI.driver.download(browserInfo.selected.version).then(() => {
          setDriverStatus(driverStateKeys.STARTING_DRIVER)
        })
        break
      case driverStateKeys.STARTING_DRIVER:
        sideAPI.driver.startProcess(browserInfo.selected.version).then(() => {
          setDriverStatus(driverStateKeys.COMPLETE)
        })
        break
      case driverStateKeys.COMPLETE:
        sideAPI.windows.open('splash').then(() => {
          sideAPI.windows.close('chromedriver')
        })
        break
    }
  }, [driverStatus])

  const processBrowserSelection = (e: ChangeEvent<{ value: string }>) => {
    const browser = browserFromString(e.target.value as string)
    if (browser.version) {
      console.log('Setting version', browser)
      setBrowserInfo((info) => ({
        ...info,
        selected: browser,
      }))
      setDriverStatus(driverStateKeys.SELECTED_BROWSER)
    }
  }

  return (
    <AppWrapper>
      <Grid className="centered pt-4" container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">Initializing Selenium IDE v4</Typography>
          <Typography variant="subtitle1">
            {driverStates[driverStatus]}
          </Typography>
        </Grid>
        {driverStatus === driverStateKeys.SELECT_BROWSER && (
          <Grid item xs={12}>
            <Select
              label="Command"
              labelId="command-label"
              size="small"
              onChange={processBrowserSelection}
              placeholder="Please select a browser"
              value={browserToString(browserInfo.selected)}
            >
              <MenuItem key={-1} value={"chrome|"}>
                Please select a browser
              </MenuItem>
              {browserInfo.browsers.map((browser, index) => (
                <MenuItem key={index} value={browserToString(browser)}>
                  Chrome - {browser.version}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        )}
      </Grid>
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectEditor), domContainer)
