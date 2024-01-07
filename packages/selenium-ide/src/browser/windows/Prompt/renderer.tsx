import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import React from 'react'

const Prompt = () => {
  const answerRef = React.useRef<HTMLInputElement>(null)
  // @ts-expect-error this exists
  const dismissPrompt = () => window.dismissPrompt()
  // @ts-expect-error this exists
  const answerPrompt = () => window.answerPrompt(answerRef.current!.value);

  React.useEffect(() => {
    answerRef.current!.focus()
    window.addEventListener('error', (e) => {
      // @ts-expect-error this exists
      window.promptError(e.message)
    })
  }, [])

  return (
    <AppWrapper>
      <Grid className="centered pt-4" container spacing={1}>
        <Grid item xs={12}>
          <Typography id="question" variant="subtitle1" />
        </Grid>
      </Grid>
      <Stack className="p-4" spacing={1}>
        <TextField
          id="answer"
          inputRef={answerRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter') answerPrompt()
            else if (e.key === 'Escape') dismissPrompt()
          }}
          name="answer"
          size="small"
        />
      </Stack>
      <Grid className="centered" container spacing={1}>
        <Grid item xs={6}>
          <Button onClick={dismissPrompt} variant="outlined">
            Cancel
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button onClick={answerPrompt} variant="contained">
            Submit
          </Button>
        </Grid>
      </Grid>
    </AppWrapper>
  )
}

renderWhenReady(Prompt)
