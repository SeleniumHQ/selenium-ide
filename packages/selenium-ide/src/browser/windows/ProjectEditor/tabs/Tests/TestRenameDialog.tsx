import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'

type CloseReason = 'Rename' | 'Cancel'

export interface TestRenameDialogProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  testID: string
  testName: string
}

const TestRenameDialog: React.FC<TestRenameDialogProps> = ({
  open,
  setOpen,
  testID,
  testName: _testName,
}) => {
  const [testName, setTestName] = React.useState(_testName)

  const handleClose = async (value: CloseReason) => {
    if (value === 'Rename') {
      await window.sideAPI.tests.rename(testID, testName)
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
    <Dialog
      classes={{
        container: 'justify-content-start',
      }}
      onClose={handleClose}
      open={open}
    >
      <DialogContent>
        <DialogContentText>
          Please specify the updated test name
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          id="name"
          label="Test Name"
          margin="dense"
          onChange={(e) => setTestName(e.target.value)}
          onKeyDown={onKeyDown}
          value={testName}
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

export default TestRenameDialog
