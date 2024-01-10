import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import React from 'react'
import TestNewDialog from './TestNewDialog'
import Drawer from '../../components/Drawer/Wrapper'
import EditorToolbar from '../../components/Drawer/EditorToolbar'
import RenamableListItem from '../../components/Drawer/RenamableListItem'
import { SIDEMainProps } from '../../components/types'

const {
  state: { setActiveTest: setSelected },
  tests: { rename },
} = window.sideAPI

const TestList: React.FC<
  Pick<SIDEMainProps, 'openDrawer' | 'session' | 'setOpenDrawer'>
> = ({ openDrawer, session, setOpenDrawer }) => {
  const {
    project: { tests },
    state: {
      activeTestID,
      playback: { commands, testResults },
    },
  } = session
  const [confirmNew, setConfirmNew] = React.useState(false)

  return (
    <Drawer
      className="flex flex-col h-100"
      open={openDrawer}
      header="Select Test"
      setOpen={setOpenDrawer}
    >
      <Stack className='flex-initial'>
        <EditorToolbar
          onAdd={async () => {
            setConfirmNew(true)
          }}
          onRemove={
            tests.length > 1
              ? () => {
                  const doDelete = window.confirm('Delete this test?')
                  if (doDelete) {
                    window.sideAPI.tests.delete(activeTestID)
                  }
                }
              : undefined
          }
          sx={{
            zIndex: 100,
          }}
        />
      </Stack>
      <List
        className="flex-col flex-1 overflow-y pt-0"
        dense
        sx={{ borderColor: 'primary.main', paddingBottom: '48px' }}
      >
        {tests
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
                selected={id === activeTestID}
                setSelected={setSelected}
                state={commands[lastCommand]?.state}
              />
            )
          })}
      </List>
      <TestNewDialog confirmNew={confirmNew} setConfirmNew={setConfirmNew} />
    </Drawer>
  )
}

export default TestList
