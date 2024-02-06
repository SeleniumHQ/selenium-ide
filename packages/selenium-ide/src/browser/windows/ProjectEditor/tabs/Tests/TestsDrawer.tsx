import List from '@mui/material/List'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import Drawer from 'browser/components/Drawer/Wrapper'
import EditorToolbar from 'browser/components/Drawer/EditorToolbar'
import RenamableListItem from 'browser/components/Drawer/RenamableListItem'
import TestCreateDialog from './TestCreateDialog'
import { SIDEMainProps } from 'browser/components/types'

const {
  state: { setActiveTest: setSelected, setActiveSuite },
  tests: { rename },
} = window.sideAPI

const TestsDrawer: FC<Pick<SIDEMainProps, 'session'>> = ({ session }) => {
  const activeSuite = session.state.activeSuiteID
  const activeTest = session.state.activeTestID
  const {
    project: { tests, suites },
    state: {
      playback: { commands: testResults },
    },
  } = session
  const [confirmNew, setConfirmNew] = React.useState(false)
  const testList = activeSuite
    ? suites
        .find((s) => s.id === activeSuite)
        ?.tests.map((id) => tests.find((t) => t.id === id)!) ?? tests
    : tests
  const safeSuiteID = suites.find((s) => s.id === activeSuite)?.id ?? ''

  return (
    <Drawer>
      <TestCreateDialog open={confirmNew} setOpen={setConfirmNew} />
      <Stack>
        <EditorToolbar
          onAdd={() => setConfirmNew(true)}
          onRemove={
            tests.length > 1
              ? () => {
                  const doDelete = window.confirm('Delete this test?')
                  if (doDelete) {
                    window.sideAPI.tests.delete(activeTest)
                  }
                }
              : undefined
          }
        />
        <FormControl size="small">
          <Select
            MenuProps={{
              anchorOrigin: {
                horizontal: 'center',
                vertical: 'top',
              },
              transformOrigin: {
                horizontal: 'center',
                vertical: 'bottom',
              },
            }}
            className="flex-initial"
            displayEmpty
            onChange={(e) => setActiveSuite(e.target.value as string)}
            placeholder="[All tests]"
            sx={{ bottom: 0 }}
            value={safeSuiteID}
          >
            <MenuItem value="">[All tests]</MenuItem>
            {suites.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <List className='flex-col flex-1 overflow-y' dense>
        {testList
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ id, name }) => {
            const testState = testResults[id]?.state
            return (
              <RenamableListItem
                id={id}
                key={id}
                name={name}
                onContextMenu={() => {
                  window.sideAPI.menus.open('testManager', [id])
                }}
                rename={rename}
                selected={id === activeTest}
                setSelected={setSelected}
                state={testState}
              />
            )
          })}
      </List>
    </Drawer>
  )
}

export default TestsDrawer
