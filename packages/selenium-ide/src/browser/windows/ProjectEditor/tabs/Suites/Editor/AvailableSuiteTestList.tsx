import { TestShape } from '@seleniumhq/side-model'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import React, { FC } from 'react'
import AvailableSuiteTestRow from './AvailableSuiteTestRow'
import EditorToolbar from 'browser/windows/ProjectEditor/components/Drawer/EditorToolbar'

export interface AvailableSuiteTestListProps {
  activeSuite: string
  allTests: TestShape[]
}

const AvailableSuiteTestList: FC<AvailableSuiteTestListProps> = ({
  activeSuite,
  allTests,
}) => (
  <Box className="flex flex-col flex-1">
    <EditorToolbar className="flex-initial" elevation={2}>
      <span className="ml-4 py-2">Available tests</span>
    </EditorToolbar>
    <List
      className="flex flex-col flex-1 overflow-y pt-0"
      dense
      sx={{
        borderColor: 'primary.main',
        verticalAlign: 'top',
      }}
    >
      {allTests
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((test, index) => {
          const { id } = test
          return (
            <AvailableSuiteTestRow
              activeSuite={activeSuite}
              index={index}
              key={id}
              test={test}
            />
          )
        })}
    </List>
  </Box>
)

export default AvailableSuiteTestList
