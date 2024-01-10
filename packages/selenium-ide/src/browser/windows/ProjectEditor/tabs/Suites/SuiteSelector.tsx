import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React from 'react'
import { SIDEMainProps } from '../../components/types'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import SuiteNewDialog from './SuiteNewDialog'
import { FormControl, InputLabel } from '@mui/material'

const SuiteSelector: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => {
  const {
    project: { suites },
    state: { activeSuiteID },
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
          const suite = await window.sideAPI.suites.create()
          await window.sideAPI.state.setActiveSuite(suite.id)
          setDisabled(false)
        }}
      >
        <FormControl className="flex flex-1">
          <InputLabel id="suite-select-label">Suite</InputLabel>
          <Select
            label="suite-select-label"
            onChange={async (event) => {
              const suite = suites.find((t) => t.id === event.target.value)
              if (suite) {
                await window.sideAPI.state.setActiveSuite(suite.id)
              }
            }}
            placeholder={suites.length ? 'Select a suite' : 'No suites found'}
            size="small"
            value={activeSuiteID}
          >
            {suites.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </EditorToolbar>
      <SuiteNewDialog confirmNew={confirmNew} setConfirmNew={setConfirmNew} />
    </>
  )
}

export default SuiteSelector
