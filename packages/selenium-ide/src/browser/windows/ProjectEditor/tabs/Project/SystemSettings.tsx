import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { CoreSessionData, VerboseBoolean } from '@seleniumhq/side-api'
import React, { FC } from 'react'

export interface SystemSettingsProps {
  state: CoreSessionData['state']
}

export interface MiniProjectShape {
  id: string
  name: string
}

const SystemSettings: FC<SystemSettingsProps> = ({ state }) => (
  <Stack className="p-4" spacing={1}>
    <FormControl>
      <InputLabel id="themePref">Theme preference</InputLabel>
      <FormHelperText>restart required to take effect</FormHelperText>
      <Select
        id="themePref"
        label="Theme Preference"
        name="themePref"
        value={state.userPrefs.themePref}
        onChange={(e: any) => {
          window.sideAPI.state.toggleUserPrefTheme(e.target.value)
        }}
      >
        <MenuItem value="System">System</MenuItem>
        <MenuItem value="Light">Light</MenuItem>
        <MenuItem value="Dark">Dark</MenuItem>
      </Select>
    </FormControl>
    <FormControl>
      <InputLabel id="insertNewCommandPref">
        New command insert preference
      </InputLabel>
      <Select
        id="insertNewCommandPref"
        label="Insert new command placement preference"
        name="insertNewCommandPref"
        value={state.userPrefs.insertCommandPref}
        onChange={(e: any) => {
          window.sideAPI.state.toggleUserPrefInsert(e.target.value)
        }}
      >
        <MenuItem value="After">After</MenuItem>
        <MenuItem value="Before">Before</MenuItem>
      </Select>
    </FormControl>
    <FormControl>
      <InputLabel id="camelCaseNames">
        Camel case various names in UI
      </InputLabel>
      <Select
        id="camelCaseNamesPref"
        label="Camel case various names in UI"
        name="camelCaseNamesPref"
        value={state.userPrefs.camelCaseNamesPref}
        onChange={(e: any) => {
          window.sideAPI.state.toggleUserPrefCamelCase(e.target.value)
        }}
      >
        <MenuItem value="Yes">Yes</MenuItem>
        <MenuItem value="No">No</MenuItem>
      </Select>
    </FormControl>
    <FormControl>
      <InputLabel id="ignoreSSLErrors">
        Ignore Certificate/SSL errors
      </InputLabel>
      <Select
        id="ignoreCertificateErrorsPref"
        label="Ignore Certificate/SSL errors - Please be aware of the risks of ignoring SSL errors"
        name="ignoreCertificateErrorsPref"
        value={state.userPrefs.ignoreCertificateErrorsPref}
        onChange={(e: any) => {
          window.sideAPI.state.toggleUserPrefIgnoreCertificateErrors(
            e.target.value
          )
        }}
      >
        <MenuItem value="Yes">Yes</MenuItem>
        <MenuItem value="No">No</MenuItem>
      </Select>
    </FormControl>
    <FormControl>
      <InputLabel id="disableCodeExportCompat">
        Disable code export compatibility mode
      </InputLabel>
      <Select
        id="disableCodeExportCompatPref"
        label="Disable code export compatibility mode"
        name="ignoreCertificateErrorsPref"
        value={state.userPrefs.disableCodeExportCompat}
        onChange={(e) => {
          window.sideAPI.state.toggleUserPrefDisableCodeExportCompat(
            e.target.value as VerboseBoolean
          )
        }}
      >
        <MenuItem value="Yes">Yes</MenuItem>
        <MenuItem value="No">No</MenuItem>
      </Select>
    </FormControl>
  </Stack>
)

export default SystemSettings
