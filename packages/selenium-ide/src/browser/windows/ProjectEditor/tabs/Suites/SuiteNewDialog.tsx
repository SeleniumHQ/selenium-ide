import * as React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

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
      const activeSuite = (await window.sideAPI.suites.create(suiteName)).id
      setSelected(activeSuite)
    }
    setConfirmNew(false)
  }

  return (
    <div>
      <Dialog open={confirmNew} onClose={handleClose}>
        <DialogContent>
          <DialogContentText>
            Please specify the new suite name
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Suite Name"
            fullWidth
            variant="standard"
            onChange={(e) => setSuiteName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose('Cancel')}>Cancel</Button>
          <Button onClick={() => handleClose('Create')}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default SuiteNewDialog