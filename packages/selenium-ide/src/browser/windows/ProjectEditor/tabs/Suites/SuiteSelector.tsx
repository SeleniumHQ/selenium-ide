import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React from 'react'
import { SIDEMainProps } from '../../../../components/types'
import EditorToolbar from '../../../../components/Drawer/EditorToolbar'
import SuiteCreateDialog from './SuiteCreateDialog'
import SuiteDeleteDialog from './SuiteDeleteDialog'

const SuiteSelector: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => {
  const {
    project: { suites },
    state: { activeSuiteID },
  } = session
  const [disabled /*, setDisabled*/] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [confirmCreate, setConfirmCreate] = React.useState(false)
  const matchingSuite = suites.find((t) => t.id === activeSuiteID)
  const activeSuiteName = matchingSuite?.name ?? ''
  return (
    <>
      <EditorToolbar
        className="py-3"
        disabled={disabled}
        onAdd={() => setConfirmCreate(true)}
        addText="Add Suite"
        onEdit={
          activeSuiteID && session.state.editor.suiteMode === 'viewer'
            ? async () => window.sideAPI.state.toggleSuiteMode('editor')
            : undefined
        }
        editText="Edit Suite"
        onRemove={
          activeSuiteID ? async () => setConfirmDelete(true) : undefined
        }
        removeText="Remove Suite"
        onView={
          activeSuiteID && session.state.editor.suiteMode === 'editor'
            ? async () => window.sideAPI.state.toggleSuiteMode('viewer')
            : undefined
        }
        viewText="View Suite Playback"
      >
        <FormControl className="flex flex-1">
          <InputLabel id="suite-select-label" margin="dense" size='small'>
            Selected Suite
          </InputLabel>
          <Select
            label="suite-select-label"
            onChange={async (event) => {
              const suite = suites.find((t) => t.id === event.target.value)
              if (suite) {
                await window.sideAPI.state.setActiveSuite(suite.id)
              }
            }}
            margin="dense"
            placeholder={suites.length ? 'Select a suite' : 'No suites found'}
            size="small"
            value={matchingSuite?.id ?? ''}
          >
            {suites.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </EditorToolbar>
      {confirmDelete && (
        <SuiteDeleteDialog
          open
          setOpen={setConfirmDelete}
          suiteID={activeSuiteID}
          suiteName={activeSuiteName}
        />
      )}
      {confirmCreate && <SuiteCreateDialog open setOpen={setConfirmCreate} />}
    </>
  )
}

export default SuiteSelector
