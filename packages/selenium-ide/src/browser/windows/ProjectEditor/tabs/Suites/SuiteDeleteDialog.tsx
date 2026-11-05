import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import { FormattedMessage } from 'react-intl'
import languageMap from 'browser/I18N/keys'

type CloseReason = 'Delete' | 'Cancel'

export interface SuiteDeleteDialogProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  suiteID: string
  suiteName: string
}

const SuiteDeleteDialog: React.FC<SuiteDeleteDialogProps> = ({
  open,
  setOpen,
  suiteID,
  suiteName,
}) => {
  const handleClose = async (value: CloseReason) => {
    if (value === 'Delete') {
      await window.sideAPI.suites.delete(suiteID)
    }
    setOpen(false)
  }

  const onEnter = React.useEffectEvent(() => handleClose('Delete'))
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
      if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        onEnter()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])
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
          <FormattedMessage
            id={languageMap.suitesTab.deleteNotice}
            values={{ name: suiteName }}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose('Cancel')}>Cancel</Button>
        <Button onClick={() => handleClose('Delete')}>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SuiteDeleteDialog
