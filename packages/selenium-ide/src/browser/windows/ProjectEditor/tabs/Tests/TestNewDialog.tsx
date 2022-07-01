import * as React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

const {
  state: { setActiveTest: setSelected },
} = window.sideAPI

type CloseReason = 'Create' | 'Cancel'

export interface TestNewDialogProps {
  confirmNew: boolean
  setConfirmNew: React.Dispatch<React.SetStateAction<boolean>>
}

const TestNewDialog: React.FC<TestNewDialogProps> = ({ confirmNew, setConfirmNew }) => {
  const [testName, setTestName] = React.useState('')

  const handleClose = async (value: CloseReason) => {
    if (value === 'Create') {
      console.log('Create ' + testName)
      const activeTest = (await window.sideAPI.tests.create(testName)).id
      console.log('activeTest is ' + activeTest)
      setSelected(activeTest)
    }
    setConfirmNew(false)
  }

  return (
    <div>
      <Dialog open={confirmNew} onClose={handleClose}>
        <DialogContent>
          <DialogContentText>
            Please specify the new test name
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Test Name"
            fullWidth
            variant="standard"
            onChange={(e) => setTestName(e.target.value)}
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

export default TestNewDialog