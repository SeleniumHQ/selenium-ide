import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import React from 'react'

const completeStatus = 'Update Downloaded'

// The main process sends the status with window.setStatus, which can run
// before the component mounts
let lastStatus = ''
const statusListeners = new Set<() => void>()
// @ts-expect-error just whatever
window.setStatus = (status: string) => {
  lastStatus = status
  statusListeners.forEach((listener) => listener())
}
const subscribeToStatus = (listener: () => void) => {
  statusListeners.add(listener)
  return () => {
    statusListeners.delete(listener)
  }
}
const getStatus = () => lastStatus

const UpdateNotifier = () => {
  const status = React.useSyncExternalStore(subscribeToStatus, getStatus)
  // @ts-expect-error this exists
  const doRestart = () => window.doRestart()
  const close = () => window.close()

  return (
    <AppWrapper>
      <Grid className="centered pt-4" container spacing={1}>
        <Grid size={12}>
          <Typography variant="subtitle1">{status}</Typography>
        </Grid>
        {status === completeStatus && (
          <>
            <Grid size={6}>
              <Button onClick={close} variant="outlined">
                OK
              </Button>
            </Grid>
            <Grid size={6}>
              <Button onClick={doRestart} variant="contained">
                Restart
              </Button>
            </Grid>
          </>
        )}
        {status.startsWith('Error') && (
          <Grid size={12}>
            <Button onClick={close} variant="outlined">
              OK
            </Button>
          </Grid>
        )}
      </Grid>
    </AppWrapper>
  )
}

renderWhenReady(UpdateNotifier)
