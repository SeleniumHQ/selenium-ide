import React, { FC } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import defaultState from 'api/models/state'

interface AppWrapperProps {
  className?: string
}

const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  const prefersDarkMode = defaultState.userPrefs.themePref 
  console.log('prefersDarkMode' + prefersDarkMode)
    defaultState.userPrefs.themePref === 'System'
      ? useMediaQuery('(prefers-color-scheme: dark)')
      : defaultState.userPrefs.themePref === 'Dark'
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
