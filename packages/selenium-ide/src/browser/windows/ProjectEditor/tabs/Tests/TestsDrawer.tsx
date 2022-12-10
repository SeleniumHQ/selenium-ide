import List from '@mui/material/List'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { SuiteShape, TestShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import Drawer from '../../components/Drawer/Wrapper'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import RenamableListItem from '../../components/Drawer/RenamableListItem'
import TestNewDialog from './TestNewDialog'
import { StateShape } from '@seleniumhq/side-api'
// import TestNewDialog from '../Tests/TestNewDialog'

export interface TestListProps {
  activeSuite: string
  activeTest: string
  commandResults: StateShape['playback']['commands']
  open: boolean
  setOpen: (b: boolean) => void
  suites: SuiteShape[]
  tests: TestShape[]
  testResults: StateShape['playback']['testResults']
}

const {
  state: { setActiveTest: setSelected, setActiveSuite },
  tests: { rename },
} = window.sideAPI

const TestList: FC<TestListProps> = ({
  activeSuite,
  activeTest,
  commandResults,
  open,
  setOpen,
  suites,
  tests,
  testResults,
}) => {
  const [confirmNew, setConfirmNew] = React.useState(false)
  const testList = activeSuite
    ? suites
        .find((s) => s.id === activeSuite)
        ?.tests.map((id) => tests.find((t) => t.id === id) as TestShape) ??
      tests
    : tests
  const safeSuiteID = suites.find((s) => s.id === activeSuite)?.id ?? ''

  return (
    <Drawer
      className="flex flex-col h-100"
      footerID="command-editor"
      open={open}
      header="Select Test"
      setOpen={setOpen}
    >
      <TestNewDialog confirmNew={confirmNew} setConfirmNew={setConfirmNew} />
      <List
        className="flex-1"
        dense
        sx={{ borderColor: 'primary.main', paddingBottom: '48px' }}
        subheader={
          <EditorToolbar
            onAdd={async () => {
              console.log('setIsOpen(true)')
              setConfirmNew(true)
            }}
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
            sx={{
              top: '47px',
              zIndex: 100,
            }}
          />
        }
      >
        {testList
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ id, name }) => {
            const lastCommand = testResults[id]?.lastCommand
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
                state={commandResults[lastCommand]?.state}
              />
            )
          })}
      </List>
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
    </Drawer>
  )
}

export default TestList
