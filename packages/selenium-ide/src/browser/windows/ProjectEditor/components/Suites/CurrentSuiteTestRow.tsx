import Box from '@mui/material/Box'
import ListItemText from '@mui/material/ListItemText'
import { TestShape } from '@seleniumhq/side-model'
import ReorderableListItem from 'browser/components/ReorderableListItem'
import React, { FC } from 'react'

const camelToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

const commandTextFormat = { color: 'primary.main', typography: 'body2' }

interface SuiteTestRowProps {
  activeSuite: string
  index: number
  test: TestShape
}

const SuiteTestRow: FC<SuiteTestRowProps> = ({
  activeSuite,
  index,
  test,
}) => (
  <ReorderableListItem
    className="pos-rel"
    divider
    dragType='TEST'
    id={test.id}
    index={index}
    key={`${test.id}-${index}`}
    reorder={(oldIndex, newIndex, item) => {
      // @ts-expect-error
      if (!item.add) {
        window.sideAPI.suites.reorderTest(activeSuite, oldIndex, newIndex)
      }
    }}
  >
    <ListItemText
      disableTypography
      primary={<Box sx={commandTextFormat}>{camelToTitleCase(test.name)}</Box>}
    />
  </ReorderableListItem>
)

export default SuiteTestRow
