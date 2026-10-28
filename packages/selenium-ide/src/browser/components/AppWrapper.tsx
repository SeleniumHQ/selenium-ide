import useMediaQuery from '@mui/material/useMediaQuery'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemePref } from '@seleniumhq/side-api'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React, { FC } from 'react'
import { IntlProvider } from 'react-intl'

type AppWrapperProps = Pick<React.HTMLAttributes<HTMLDivElement>, 'children'>
const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  const [themePref, setThemePref] = React.useState<ThemePref>('System')
  React.useEffect(() => {
    if (!window?.sideAPI?.state) return
    window.sideAPI.state
      .getUserPrefs()
      .then((prefs) => setThemePref(prefs.themePref || 'System'))
  }, [])
  const systemPref = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersDarkMode =
    themePref === 'System' ? systemPref : themePref === 'Dark'
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  )
  const [languageMap, setLanguageMap] = React.useState<any>({})
  React.useEffect(() => {
    window.sideAPI.system.getLanguageMap(true).then((result) => {
      setLanguageMap(result)
    })
  }, [])

  return (
    // The app only loads the English messages for now
    <IntlProvider defaultLocale="en" locale="en" messages={languageMap}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </IntlProvider>
  )
}

export default AppWrapper
