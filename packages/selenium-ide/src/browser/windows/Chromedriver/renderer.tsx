import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { Browser } from '@seleniumhq/get-driver'
import AppWrapper from 'browser/components/AppWrapper'
import { BrowserInfo, BrowsersInfo } from 'main/types'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

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
  `${browser.browser}|${browser.version}`
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
        window.sideAPI.driver.listBrowsers().then(async (info) => {
          setBrowserInfo(info)
          if (info.selected.version) {
            setDriverStatus(driverStateKeys.DOWNLOADING_DRIVER)
          } else {
            setDriverStatus(driverStateKeys.SELECT_BROWSER)
          }
        })
        break
      case driverStateKeys.SELECTED_BROWSER:
        window.sideAPI.driver.selectBrowser(browserInfo.selected).then(() => {
          setDriverStatus(driverStateKeys.DOWNLOADING_DRIVER)
        })
        break
      case driverStateKeys.DOWNLOADING_DRIVER:
        window.sideAPI.driver.download(browserInfo.selected).then(() => {
          setDriverStatus(driverStateKeys.STARTING_DRIVER)
        })
        break
      case driverStateKeys.STARTING_DRIVER:
        window.sideAPI.driver.startProcess(browserInfo.selected).then(() => {
          setDriverStatus(driverStateKeys.COMPLETE)
        })
        break
      case driverStateKeys.COMPLETE:
        window.sideAPI.windows.open('splash').then(() => {
          window.sideAPI.windows.close('chromedriver')
        })
        break
    }
  }, [driverStatus])

  const processBrowserSelection = (e: SelectChangeEvent<{ value: string }>) => {
    const browser = browserFromString(e.target.value as string)
    if (browser.version) {
      console.log('Setting version', browser)
      setBrowserInfo((info) => ({
        ...info,
        selected: browser,
      }))
    }
  }
  const confirmBrowserSelection = () => {
    setDriverStatus(driverStateKeys.SELECTED_BROWSER)
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
          <>
            <Grid item xs={2} />
            <Grid item xs={4}>
              <Select
                label="Command"
                labelId="command-label"
                size="small"
                onChange={processBrowserSelection}
                placeholder="Please select a browser"
                value={browserToString(browserInfo.selected) as unknown as undefined}
              >
                <MenuItem key={-1} value={'chrome|'}>
                  Please select a browser
                </MenuItem>
                {browserInfo.browsers.map((browser, index) => (
                  <MenuItem key={index} value={browserToString(browser)}>
                    {browser.browser} - {browser.version}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={4}>
              <Button
                disabled={!browserInfo.selected.version}
                onClick={confirmBrowserSelection}
              >
                Confirm
              </Button>
            </Grid>
            <Grid item xs={2} />
          </>
        )}
      </Grid>
    </AppWrapper>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectEditor), domContainer)
