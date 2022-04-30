import { TestShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import CurrentSuiteTestRow from './CurrentSuiteTestRow'
import useReorderPreview from 'browser/hooks/useReorderPreview'
import DropTargetListItem from 'browser/components/DropTargetListItem'
import { ListItemText, ListSubheader } from '@mui/material'
import makeKeyboundNav from 'browser/hooks/useKeyboundNav'
import ReorderableList from 'browser/components/ReorderableList'

export interface CurrentSuiteTestListProps {
  activeSuite: string
  bottomOffset: number
  selectedIndexes: number[]
  tests: TestShape[]
}

const useKeyboundNav = makeKeyboundNav(window.sideAPI.state.updateStepSelection)

const CurrentSuiteTestList: FC<CurrentSuiteTestListProps> = ({
  activeSuite,
  bottomOffset,
  selectedIndexes,
  tests,
}) => {
  const [preview, reorderPreview, resetPreview] = useReorderPreview(
    tests,
    selectedIndexes,
    (t) => t.id
  )
  useKeyboundNav(tests, selectedIndexes)
  return (
    <ReorderableList
      bottomOffset={bottomOffset}
      dense
      sx={{
        display: 'inline-block',
        width: '50%',
      }}
    >

      <ListSubheader className="lh-36" sx={{ top: '48px', zIndex: 100 }}>
        Tests in suite
      </ListSubheader>
      {preview.map(([id, origIndex], index) => {
        const test = tests[origIndex]
        if (!test) {
          return null
        }
        return (
          <CurrentSuiteTestRow
            activeSuite={activeSuite}
            index={index}
            key={`${id}-${origIndex}`}
            reorder={reorderPreview}
            reorderReset={resetPreview}
            selected={selectedIndexes.includes(origIndex)}
            test={test}
          />
        )
      })}
      <DropTargetListItem
        dragType="TEST"
        index={tests.length}
        reorderConfirm={() => {}}
        reorder={reorderPreview}
        reorderReset={resetPreview}
      >
        <ListItemText>Drop Tests Here</ListItemText>
      </DropTargetListItem>
    </ReorderableList>
  )
}

export default CurrentSuiteTestList
