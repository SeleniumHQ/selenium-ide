import { TestShape } from '@seleniumhq/side-model'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import React, { FC, useEffect } from 'react'
import CurrentSuiteTestRow from './CurrentSuiteTestRow'
import useReorderPreview from 'browser/hooks/useReorderPreview'
import DropTargetListItem from 'browser/components/DropTargetListItem'
import { ListItemText } from '@mui/material'

export interface CurrentSuiteTestListProps {
  activeSuite: string
  bottomOffset: number
  selectedIndexes: number[]
  tests: TestShape[]
}

const traverseKeys: KeyboardEvent['key'][] = ['ArrowUp', 'ArrowDown']

const CurrentSuiteTestList: FC<CurrentSuiteTestListProps> = ({
  activeSuite,
  bottomOffset,
  selectedIndexes,
  tests,
}) => {
  const [preview, reorderPreview, resetPreview] = useReorderPreview(
    tests,
    selectedIndexes
  )
  useEffect(() => {
    resetPreview()
  }, [tests.map((t) => t.id).join('-')])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (traverseKeys.includes(e.key)) {
        let activeTestIndex = 0
        if (selectedIndexes.length) {
          activeTestIndex = selectedIndexes.slice(-1)[0]
        }
        const nextTestIndex =
          e.key === 'ArrowUp' ? activeTestIndex - 1 : activeTestIndex + 1
        const nextTest = tests[nextTestIndex]
        if (nextTest) {
          const removeKey = e.altKey
          const anyAddKey = e.shiftKey || e.ctrlKey || e.metaKey
          window.sideAPI.state.updateTestSelection(
            nextTestIndex,
            e.shiftKey,
            !removeKey && anyAddKey,
            !removeKey && !anyAddKey
          )
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
  return (
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
          Tests in suite
        </ListSubheader>
      }
    >
      {preview.map(([test, origIndex], index) => {
        return (
          <CurrentSuiteTestRow
            activeSuite={activeSuite}
            index={index}
            key={`${test.id}-${index}`}
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
        reorderConfirm={(_oldIndex, newIndex, item) => {
          // @ts-expect-error
          if (item.add) {
            window.sideAPI.suites.addTest(activeSuite, item.id, newIndex)
          }
        }}
        reorder={reorderPreview}
        reorderReset={resetPreview}
      >
        <ListItemText>Drop Tests Here</ListItemText>
      </DropTargetListItem>
    </List>
  )
}

export default CurrentSuiteTestList
