import { TestShape } from '@seleniumhq/side-model'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import React, { FC } from 'react'
import CurrentSuiteTestRow from './CurrentSuiteTestRow'

export interface CurrentSuiteTestListProps {
  activeSuite: string
  bottomOffset: number
  tests: TestShape[]
}

const CurrentSuiteTestList: FC<CurrentSuiteTestListProps> = ({
  activeSuite,
  bottomOffset,
  tests,
}) => (
  <List
    dense
    sx={{
      borderColor: 'primary.main',
      display: 'inline-block',
      marginBottom: `${bottomOffset}px`,
      width: '50%',
    }}
    subheader={
      <ListSubheader className="lh-36" sx={{ top: '96px', zIndex: 100 }}>
        Tests in suite
      </ListSubheader>
    }
  >
    {tests.map((test, index) => {
      const { id } = test
      return (
        <CurrentSuiteTestRow
          activeSuite={activeSuite}
          index={index}
          key={id}
          test={test}
        />
      )
    })}
  </List>
)

export default CurrentSuiteTestList
