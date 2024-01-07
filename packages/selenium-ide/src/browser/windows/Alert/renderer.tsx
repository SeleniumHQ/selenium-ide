import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import React from 'react'

const Prompt = () => {
  // @ts-expect-error this exists
  const acceptAlert = () => window.acceptAlert();

  React.useEffect(() => {
    window.addEventListener('error', (e) => {
      // @ts-expect-error this exists
      window.alertError(e.message)
    })
  }, [])

  return (
    <AppWrapper>
      <Grid className="centered pt-4" container spacing={1}>
        <Grid item xs={12}>
          <Typography id="alert" variant="subtitle1" />
        </Grid>
      </Grid>
      <Grid className="centered" container spacing={1}>
        <Grid item xs={12}>
          <Button onClick={acceptAlert} variant="contained">
            OK
          </Button>
        </Grid>
      </Grid>
    </AppWrapper>
  )
}

renderWhenReady(Prompt)
