import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React from 'react'
import { SIDEMainProps } from '../../../../components/types'
import SuitesToolbar from './Toolbar'

const SuiteSelector: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => {
  const {
    project: { suites },
    state: { activeSuiteID },
  } = session
  const matchingSuite = React.useMemo(
    () => suites.find((t) => t.id === activeSuiteID),
    [activeSuiteID, suites]
  )
  return (
    <SuitesToolbar>
      <FormControl className="flex flex-1">
        <InputLabel id="suite-select-label" margin="dense" size="small">
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
    </SuitesToolbar>
  )
}

export default SuiteSelector
