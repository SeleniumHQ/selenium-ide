import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { TestShape } from '@seleniumhq/side-model'
import React, { FC } from 'react'

const {
  suites: { addTest, removeTest },
} = window.sideAPI

const camelToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

const commandTextFormat = { color: 'primary.main', typography: 'body2' }

interface SuiteTestRowProps {
  activeSuite: string
  selected: boolean
  test: TestShape
}

const SuiteTestRow: FC<SuiteTestRowProps> = ({
  activeSuite,
  selected,
  test,
}) => (
  <ListItem
    className="pos-rel"
    divider
    key={test.id}
    secondaryAction={
      <Checkbox
        edge="end"
        onChange={() => {
          const handler = selected ? removeTest : addTest
          return handler(activeSuite, test.id)
        }}
        checked={selected}
        inputProps={{ 'aria-labelledby': test.name }}
      />
    }
    selected={selected}
  >
    <ListItemText
      disableTypography
      primary={<Box sx={commandTextFormat}>{camelToTitleCase(test.name)}</Box>}
    />
  </ListItem>
)

export default SuiteTestRow
