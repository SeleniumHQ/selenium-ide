import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import {
  getActiveCommand,
  getActiveTest,
} from '@seleniumhq/side-api/dist/helpers/getActiveData'
import React, { useRef } from 'react'
import CommandEditor from './TestCommandEditor'
import CommandList from './TestCommandList'
import CommandTable from './TestCommandTable'
import MainHeader from '../../components/Main/Header'
import { loadingID } from '@seleniumhq/side-api/dist/constants/loadingID'
import { SIDEMainProps } from '../../components/types'
import AppBar from '../../components/AppBar'
import TestSelector from './TestSelector'

const sxCenter = { textAlign: 'center' }
const NoTestFound = () => (
  <>
    <MainHeader />
    <Paper className="p-4" elevation={1} id="command-editor" square>
      <Typography sx={sxCenter}>No Test Selected</Typography>
    </Paper>
  </>
)

const TestsTab: React.FC<
  Pick<
    SIDEMainProps,
    'openDrawer' | 'session' | 'setOpenDrawer' | 'setTab' | 'tab'
  >
> = ({ openDrawer, session, setOpenDrawer, setTab, tab }) => {
  const {
    state: {
      activeTestID,
      commands,
      editor: { selectedCommandIndexes },
      playback,
    },
  } = session

  const ref = useRef<HTMLDivElement>(null)
  const [isTableWidth, setIsTableWidth] = React.useState(false)
  React.useEffect(() => {
    if (!ref.current) {
      return
    }
    const current = ref.current
    const width = current.offsetWidth
    setIsTableWidth(width > 600)
    const resizeObserver = new ResizeObserver(() => {
      const width = current.offsetWidth
      setIsTableWidth(width > 500)
    })

    // Start observing the target element
    resizeObserver.observe(current)

    // Clean up by disconnecting the observer when the component unmounts
    return () => {
      resizeObserver.disconnect()
    }
  }, [ref])
  const CommandsComponent = isTableWidth ? CommandTable : CommandList
  const activeTest = getActiveTest(session)
  const activeCommand = getActiveCommand(session)
  const disabled = ['playing', 'recording'].includes(session.state.status)
  return (
    <Box className="fill flex flex-col">
      <Box className="flex-initial">
        <AppBar
          openDrawer={openDrawer}
          session={session}
          setOpenDrawer={setOpenDrawer}
          setTab={setTab}
          tab={tab}
        />
      </Box>
      <Box className="flex-1 flex-col" ref={ref}>
        <TestSelector session={session} />
        {activeTestID === loadingID ? (
          <NoTestFound />
        ) : (
          <>
            <CommandsComponent
              activeTest={activeTestID}
              commands={activeTest.commands}
              commandStates={playback.commands}
              disabled={disabled}
              selectedCommandIndexes={selectedCommandIndexes}
            />
          </>
        )}
      </Box>
      <CommandEditor
        commands={commands}
        command={activeCommand}
        disabled={disabled}
        selectedCommandIndexes={selectedCommandIndexes}
        testID={activeTestID}
      />
    </Box>
  )
}

export default TestsTab
