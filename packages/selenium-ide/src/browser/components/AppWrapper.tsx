import React, { FC } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

interface AppWrapperProps {
  className?: string
}

const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  const [themePref, setThemePref] = React.useState('system')
  React.useEffect(() => {
    window.sideAPI.state
      .getUserPrefs()
      .then((test) => setThemePref(test.themePref))
  }, [])
  const prefersDarkMode =
    themePref === 'System'
      ? useMediaQuery('(prefers-color-scheme: dark)')
      : themePref === 'Dark'
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default AppWrapper
