import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { SuiteShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import { Checkbox, FormControlLabel } from '@mui/material'

export interface SuiteEditorProps {
  suite: SuiteShape
}

export interface MiniSuiteShape {
  id: string
  name: string
}

const SuiteEditor: FC<SuiteEditorProps> = ({ suite }) => (
  <Stack className="p-4" spacing={1}>
    <FormControl>
      <TextField
        label="Name"
        name="name"
        onChange={(e: any) => {
          window.sideAPI.suites.update(suite.id, {
            name: e.target.value,
          })
        }}
        size="small"
        value={suite.name}
      />
    </FormControl>
    <FormControl>
      <TextField
        label="Timeout"
        name="timeout"
        onChange={(e: any) => {
          window.sideAPI.suites.update(suite.id, {
            timeout: parseInt(e.target.value),
          })
        }}
        size="small"
        value={suite.timeout}
      />
    </FormControl>
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox
            onChange={(_e, checked) => {
              window.sideAPI.suites.update(suite.id, {
                parallel: checked,
              })
            }}
            checked={suite.parallel}
          />
        }
        label="Parallel"
      />
    </FormControl>
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox
            onChange={(_e, checked) => {
              window.sideAPI.suites.update(suite.id, {
                persistSession: checked,
              })
            }}
            checked={suite.persistSession}
          />
        }
        label="Persist Session"
      />
    </FormControl>
  </Stack>
)

export default SuiteEditor
