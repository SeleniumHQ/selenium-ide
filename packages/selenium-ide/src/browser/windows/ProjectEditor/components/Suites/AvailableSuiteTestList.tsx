import { TestShape } from '@seleniumhq/side-model'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import React, { FC } from 'react'
import AvailableSuiteTestRow from './AvailableSuiteTestRow'

export interface AvailableSuiteTestListProps {
  activeSuite: string
  allTests: TestShape[]
  bottomOffset: number
  tests: string[]
}

const AvailableSuiteTestList: FC<AvailableSuiteTestListProps> = ({
  activeSuite,
  allTests,
  bottomOffset,
  tests,
}) => (
  <List
    dense
    sx={{
      borderColor: 'primary.main',
      display: 'inline-block',
      marginBottom: `${bottomOffset}px`,
      verticalAlign: 'top',
      width: '50%',
    }}
    subheader={
      <ListSubheader className="lh-36" sx={{ top: '96px', zIndex: 100 }}>
        Available Tests
      </ListSubheader>
    }
  >
    {allTests.map((test, index) => {
      const { id } = test
      return (
        <AvailableSuiteTestRow
          activeSuite={activeSuite}
          index={index}
          key={id}
          test={test}
          selected={tests.includes(id)}
        />
      )
    })}
  </List>
)

export default AvailableSuiteTestList
