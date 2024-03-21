import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React, { useContext } from 'react'
import EditorToolbar from '../../../../components/Drawer/EditorToolbar'
import TestCreateDialog from './TestCreateDialog'
import TestRenameDialog from './TestRenameDialog'
import TestDeleteDialog from './TestDeleteDialog'
import { context as activetestIDContext } from 'browser/contexts/active-test'
import { context as testsContext } from 'browser/contexts/tests'

const TestSelector: React.FC = () => {
  const [disabled /*, setDisabled*/] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [confirmRename, setConfirmRename] = React.useState(false)
  const [confirmCreate, setConfirmCreate] = React.useState(false)
  const { activeTestID } = useContext(activetestIDContext)
  const tests = useContext(testsContext)
  const activeTest = React.useMemo(() => tests.find((t) => t.id === activeTestID), [
    tests,
    activeTestID,
  ])
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
                await window.sideAPI.state.setActiveTest(event.target.value)
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
          testName={activeTest?.name || ''}
        />
      )}
      {confirmRename && (
        <TestRenameDialog
          open
          setOpen={setConfirmRename}
          testID={activeTestID}
          testName={activeTest?.name || ''}
        />
      )}
      {confirmCreate && <TestCreateDialog open setOpen={setConfirmCreate} />}
    </>
  )
}

export default TestSelector
