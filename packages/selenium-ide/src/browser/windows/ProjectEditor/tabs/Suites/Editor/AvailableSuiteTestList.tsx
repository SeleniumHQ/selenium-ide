import { TestShape } from '@seleniumhq/side-model'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import React, { FC } from 'react'
import AvailableSuiteTestRow from './AvailableSuiteTestRow'

export interface AvailableSuiteTestListProps {
  activeSuite: string
  allTests: TestShape[]
  bottomOffset: number
}

const AvailableSuiteTestList: FC<AvailableSuiteTestListProps> = ({
  activeSuite,
  allTests,
  bottomOffset,
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
      <ListSubheader className="lh-36" sx={{ top: '48px', zIndex: 100 }}>
        Available Tests
      </ListSubheader>
    }
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
)

export default AvailableSuiteTestList
