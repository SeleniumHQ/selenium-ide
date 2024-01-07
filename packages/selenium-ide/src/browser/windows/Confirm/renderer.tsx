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
  const acceptConfirmation = () => window.acceptConfirmation();

  React.useEffect(() => {
    window.addEventListener('error', (e) => {
      // @ts-expect-error this exists
      window.confirmError(e.message)
    })
    window.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') acceptConfirmation()
      else if (e.key === 'Escape') dismissConfirmation()
    })
  }, [])

  return (
    <AppWrapper>
      <Grid className="centered pt-4" container spacing={1}>
        <Grid item xs={12}>
          <Typography id="confirm" variant="subtitle1" />
        </Grid>
      </Grid>
      <Grid className="centered" container spacing={1}>
        <Grid item xs={6}>
          <Button onClick={dismissConfirmation} variant="outlined">
            Cancel
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button onClick={acceptConfirmation} variant="contained">
            Confirm
          </Button>
        </Grid>
      </Grid>
    </AppWrapper>
  )
}

renderWhenReady(Confirm)
