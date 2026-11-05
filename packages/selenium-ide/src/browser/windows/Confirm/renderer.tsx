import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import React from 'react'

const Confirm = () => {
  // @ts-expect-error this exists
  const dismissConfirmation = () => window.dismissConfirmation()
  // @ts-expect-error this exists
  const acceptConfirmation = () => window.acceptConfirmation()

  React.useEffect(() => {
    const onError = (e: ErrorEvent) => {
      // @ts-expect-error this exists
      window.confirmError(e.message)
    }
    const onKeyPress = (e: KeyboardEvent) => {
      // @ts-expect-error this exists
      if (e.key === 'Enter') window.acceptConfirmation()
      // @ts-expect-error this exists
      else if (e.key === 'Escape') window.dismissConfirmation()
    }
    window.addEventListener('error', onError)
    window.addEventListener('keypress', onKeyPress)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('keypress', onKeyPress)
    }
  }, [])

  return (
    <AppWrapper>
      <Grid className="centered pt-4" container spacing={1}>
        <Grid size={12}>
          <Typography id="confirm" variant="subtitle1" />
        </Grid>
      </Grid>
      <Grid className="centered" container spacing={1}>
        <Grid size={6}>
          <Button onClick={dismissConfirmation} variant="outlined">
            Cancel
          </Button>
        </Grid>
        <Grid size={6}>
          <Button onClick={acceptConfirmation} variant="contained">
            Confirm
          </Button>
        </Grid>
      </Grid>
    </AppWrapper>
  )
}

renderWhenReady(Confirm)
