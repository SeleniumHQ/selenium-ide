import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React from 'react'
import { SIDEMainProps } from '../../../../components/types'
import EditorToolbar from '../../../../components/Drawer/EditorToolbar'
import TestCreateDialog from './TestCreateDialog'
import TestRenameDialog from './TestRenameDialog'
import TestDeleteDialog from './TestDeleteDialog'

const TestSelector: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => {
  const {
    project: { tests },
    state: { activeTestID },
  } = session
  const [disabled /*, setDisabled*/] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [confirmRename, setConfirmRename] = React.useState(false)
  const [confirmCreate, setConfirmCreate] = React.useState(false)
  const activeTestName = tests.find((t) => t.id === activeTestID)?.name ?? ''
  return (
    <>
      <EditorToolbar
        className="py-3 z-2"
        disabled={disabled}
        onAdd={() => setConfirmCreate(true)}
        addText="Add Test"
        onRemove={activeTestID ? async () => setConfirmDelete(true) : undefined}
        removeText="Remove Test"
        onEdit={activeTestID ? async () => setConfirmRename(true) : undefined}
        editText="Rename Test"
      >
        <FormControl className="flex flex-1">
          <InputLabel id="test-select-label">Selected Test</InputLabel>
          {activeTestID && (
            <Select
              label="test-select-label"
              onChange={async (event) => {
                const test = tests.find((t) => t.id === event.target.value)
                if (test) {
                  await window.sideAPI.state.setActiveTest(test.id)
                }
              }}
              margin="dense"
              placeholder={tests.length ? 'Select a test' : 'No tests found'}
              size="small"
              value={activeTestID}
            >
              {tests.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </EditorToolbar>
      {confirmDelete && (
        <TestDeleteDialog
          open
          setOpen={setConfirmDelete}
          testID={activeTestID}
          testName={activeTestName}
        />
      )}
      {confirmRename && (
        <TestRenameDialog
          open
          setOpen={setConfirmRename}
          testID={activeTestID}
          testName={activeTestName}
        />
      )}
      {confirmCreate && <TestCreateDialog open setOpen={setConfirmCreate} />}
    </>
  )
}

export default TestSelector
