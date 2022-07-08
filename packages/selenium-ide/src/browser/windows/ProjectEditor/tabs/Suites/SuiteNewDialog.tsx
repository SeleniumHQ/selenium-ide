import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'

const {
  state: { setActiveSuite: setSelected },
} = window.sideAPI

type CloseReason = 'Create' | 'Cancel'

export interface SuiteNewDialogProps {
  confirmNew: boolean
  setConfirmNew: React.Dispatch<React.SetStateAction<boolean>>
}

const SuiteNewDialog: React.FC<SuiteNewDialogProps> = ({ confirmNew, setConfirmNew }) => {
  const [suiteName, setSuiteName] = React.useState('')

  const handleClose = async (value: CloseReason) => {
    if (value === 'Create') {
      createSuite()
    }
    setConfirmNew(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      createSuite()
      setConfirmNew(false)
    }
  }

  const createSuite = async () => {
    const activeSuite = (await window.sideAPI.suites.create(suiteName)).id
    setSelected(activeSuite)
  }

  return (
    <Dialog open={confirmNew} onClose={handleClose} style={{ zIndex: 99999 }}>
      <DialogContent>
        <DialogContentText>Please specify the new suite name</DialogContentText>
        <TextField
          autoFocus
          fullWidth
          id="name"
          label="Suite Name"
          margin="dense"
          onChange={(e) => setSuiteName(e.target.value)}
          onKeyDown={onKeyDown}
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose('Cancel')}>Cancel</Button>
        <Button onClick={() => handleClose('Create')}>Create</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SuiteNewDialog
