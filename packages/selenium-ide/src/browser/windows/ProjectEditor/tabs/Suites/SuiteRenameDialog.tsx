import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'

type CloseReason = 'Rename' | 'Cancel'

export interface SuiteRenameDialogProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  suiteID: string
  suiteName: string
}

const SuiteRenameDialog: React.FC<SuiteRenameDialogProps> = ({
  open,
  setOpen,
  suiteID,
  suiteName: _suiteName,
}) => {
  const [suiteName, setSuiteName] = React.useState(_suiteName)

  const handleClose = async (value: CloseReason) => {
    if (value === 'Rename') {
      await window.sideAPI.suites.update(suiteID, {name: suiteName})
    }
    setOpen(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      handleClose('Rename')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <DialogContentText>Please specify the updated suite name</DialogContentText>
        <TextField
          autoFocus
          fullWidth
          id="name"
          label="Suite Name"
          margin="dense"
          onChange={(e) => setSuiteName(e.target.value)}
          onKeyDown={onKeyDown}
          value={suiteName}
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose('Cancel')}>Cancel</Button>
        <Button onClick={() => handleClose('Rename')}>Rename</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SuiteRenameDialog
