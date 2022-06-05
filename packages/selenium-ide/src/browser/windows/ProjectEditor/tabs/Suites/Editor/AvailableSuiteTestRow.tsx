import Box from '@mui/material/Box'
import ListItemText from '@mui/material/ListItemText'
import { TestShape } from '@seleniumhq/side-model'
import DraggableListItem from 'browser/components/DraggableListItem'
import React, { FC } from 'react'

const camelToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

const commandTextFormat = { color: 'primary.main', typography: 'body2' }

interface AvailableSuiteTestRowProps {
  activeSuite: string
  index: number
  test: TestShape
}

const AvailableSuiteTestRow: FC<AvailableSuiteTestRowProps> = ({
  activeSuite,
  index,
  test,
}) => (
  <DraggableListItem
    className="pos-rel"
    divider
    dragType="TEST"
    end={(result) => {
      // @ts-expect-error
      window.sideAPI.suites.addTests(activeSuite, [test.id], result.newIndex)
    }}
    id={test.id}
    index={index}
    key={test.id}
    metadata={{ add: true }}
  >
    <ListItemText
      disableTypography
      primary={<Box sx={commandTextFormat}>{camelToTitleCase(test.name)}</Box>}
    />
  </DraggableListItem>
)

export default AvailableSuiteTestRow
