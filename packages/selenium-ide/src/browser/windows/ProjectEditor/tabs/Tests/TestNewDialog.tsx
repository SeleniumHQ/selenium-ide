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

export default function FormDialog() {
  const [open, setOpen] = React.useState(true)
    const [testName, setTestName] = React.useState('')
    // setOpen(mode)

  console.log('open is ' + open)

  const handleClose = async (value: CloseReason) => {
    if (value === 'Create') {
      console.log('Create ' + testName)
      const activeTest = (await window.sideAPI.tests.create(testName)).id
      console.log('activeTest is ' + activeTest)
      setSelected(activeTest)
    }
    setOpen(false)
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
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
