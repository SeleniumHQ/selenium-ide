import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { Browser } from '@seleniumhq/get-driver'
import { BrowserInfo, BrowsersInfo } from 'main/types'
import React, { useEffect, useState } from 'react'

const browserToString = (browser: BrowserInfo): string =>
  `${browser.browser}|${browser.version}`
const browserFromString = (browserString: string): BrowserInfo => {
  const [browser, version] = browserString.split('|')
  return { browser: browser as Browser, version }
}

const DriverSelector = () => {
  const [browserInfo, setBrowserInfo] = useState<BrowsersInfo>({
    browsers: [],
    selected: { browser: 'chrome', version: '' },
  })
  useEffect(() => {
    window.sideAPI.driver.listBrowsers().then(async (info) => {
      setBrowserInfo(info)
    })
  }, [])
  const processBrowserSelection = async (e: SelectChangeEvent<string>) => {
    const browser = browserFromString(e.target.value as string)

    if (browser) {
      console.log('Setting browser', browser)
      setBrowserInfo(info => ({ browsers: info!.browsers, selected: null }))
      await window.sideAPI.driver.download(browser)
      await window.sideAPI.driver.stopProcess()
      await window.sideAPI.driver.startProcess(browser)
      await window.sideAPI.driver.selectBrowser(browser)
      setBrowserInfo(info => ({ browsers: info!.browsers, selected: browser }))
    }
  }
  return (
    <>
      <InputLabel id="browser-label">
        Selected Playback Browser
      </InputLabel>
      {browserInfo.selected ? (
        <Select
          label="Selected Playback Browser"
          labelId="browser-label"
          size="small"
          onChange={processBrowserSelection}
          placeholder="Please select a browser"
          value={browserToString(browserInfo.selected)}
        >
          {browserInfo.browsers.map((browser, index) => (
            <MenuItem key={index} value={browserToString(browser)}>
              {browser.browser} - {browser.version}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Select
          disabled
          label="Selected Playback Browser"
          labelId="browser-label"
          size="small"
          onChange={processBrowserSelection}
          placeholder="Please select a browser"
          value=""
        >
          <MenuItem value="">
            <em>Loading...</em>
          </MenuItem>
        </Select>
      )}
    </>
  )
}

export default DriverSelector
