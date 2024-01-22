import Box from '@mui/material/Box'
import ListItemText from '@mui/material/ListItemText'
import { TestShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'
import useReorderPreview from 'browser/hooks/useReorderPreview'
import DropTargetListItem from 'browser/components/DropTargetListItem'
import makeKeyboundNav from 'browser/hooks/useKeyboundNav'
import ReorderableList from 'browser/components/ReorderableList'
import EditorToolbar from 'browser/components/Drawer/EditorToolbar'
import CurrentSuiteTestRow from './CurrentSuiteTestRow'

export interface CurrentSuiteTestListProps {
  activeSuite: string
  selectedIndexes: number[]
  tests: TestShape[]
}

const useKeyboundNav = makeKeyboundNav(window.sideAPI.state.updateStepSelection)

const CurrentSuiteTestList: FC<CurrentSuiteTestListProps> = ({
  activeSuite,
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
    <Box className="flex flex-col flex-1">
      <EditorToolbar className="flex-initial py-2 z-1" elevation={1}>
        <span className="ms-4 py-2">Tests in suite</span>
      </EditorToolbar>
      <ReorderableList className="flex flex-col flex-1 overflow-y pt-0" dense>
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
    </Box>
  )
}

export default CurrentSuiteTestList
