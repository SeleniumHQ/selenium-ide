import React, { FC } from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import CssBaseline from '@material-ui/core/CssBaseline'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '../index.css'

const AppWrapper: FC<any> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

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
      <Paper className="fill">{children}</Paper>
    </ThemeProvider>
  )
}

export default AppWrapper
