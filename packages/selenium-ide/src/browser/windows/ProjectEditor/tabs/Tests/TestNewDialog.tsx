import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'

const {
  state: { setActiveTest: setSelected },
} = window.sideAPI

type CloseReason = 'Create' | 'Cancel'

export interface TestNewDialogProps {
  confirmNew: boolean
  setConfirmNew: React.Dispatch<React.SetStateAction<boolean>>
}

const TestNewDialog: React.FC<TestNewDialogProps> = ({
  confirmNew,
  setConfirmNew,
}) => {
  const [testName, setTestName] = React.useState('')

  const handleClose = async (value: CloseReason) => {
    if (value === 'Create') {
      createTest()
    }
    setConfirmNew(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      createTest()
      setConfirmNew(false)
    }
  }

  const createTest = async () => {
    console.log('Create ' + testName)
    const activeTest = (await window.sideAPI.tests.create(testName)).id
    console.log('activeTest is ' + activeTest)
    setSelected(activeTest)
  }

  return (
    <Dialog open={confirmNew} onClose={handleClose} style={{ zIndex: 99999 }}>
      <DialogContent>
        <DialogContentText>Please specify the new test name</DialogContentText>
        <TextField
          autoFocus
          fullWidth
          id="name"
          label="Test Name"
          margin="dense"
          onChange={(e) => setTestName(e.target.value)}
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

export default TestNewDialog
