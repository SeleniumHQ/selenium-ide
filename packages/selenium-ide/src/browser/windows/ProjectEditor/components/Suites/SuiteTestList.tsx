import { TestShape } from '@seleniumhq/side-model'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import React, { FC } from 'react'
import SuiteTestRow from './SuiteTestRow'

export interface SuiteTestListProps {
  activeSuite: string
  allTests: TestShape[]
  bottomOffset: number
  tests: string[]
}

const SuiteTestList: FC<SuiteTestListProps> = ({
  activeSuite,
  allTests,
  bottomOffset,
  tests,
}) => (
  <List
    dense
    sx={{
      borderColor: 'primary.main',
      marginBottom: `${bottomOffset}px`,
      marginTop: '48px',
    }}
    subheader={
      <ListSubheader className="lh-36" sx={{ top: '96px', zIndex: 100 }}>
        Tests
      </ListSubheader>
    }
  >
    {allTests.map((test) => {
      const { id } = test
      return (
        <SuiteTestRow
          activeSuite={activeSuite}
          test={test}
          selected={tests.includes(id)}
        />
      )
    })}
  </List>
)

export default SuiteTestList
