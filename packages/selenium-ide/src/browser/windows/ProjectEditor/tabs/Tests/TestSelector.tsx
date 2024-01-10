import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React from 'react'
import { SIDEMainProps } from '../../components/types'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import TestNewDialog from './TestNewDialog'
import { FormControl, InputLabel } from '@mui/material'

const TestSelector: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => {
  const {
    project: { tests },
    state: { activeTestID },
  } = session
  const [disabled, setDisabled] = React.useState(false)
  const [confirmNew, setConfirmNew] = React.useState(false)
  return (
    <>
      <EditorToolbar
        className="py-3"
        disabled={disabled}
        onAdd={async () => {
          setDisabled(true)
          const test = await window.sideAPI.tests.create()
          await window.sideAPI.state.setActiveTest(test.id)
          setDisabled(false)
        }}
      >
        <FormControl className="flex flex-1">
          <InputLabel id="test-select-label">Test</InputLabel>
          <Select
            label="test-select-label"
            onChange={async (event) => {
              const test = tests.find((t) => t.id === event.target.value)
              if (test) {
                await window.sideAPI.state.setActiveTest(test.id)
              }
            }}
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
        </FormControl>
      </EditorToolbar>
      <TestNewDialog confirmNew={confirmNew} setConfirmNew={setConfirmNew} />
    </>
  )
}

export default TestSelector
