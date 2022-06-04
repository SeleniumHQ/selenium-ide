import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { CommandShape, TestShape } from '@seleniumhq/side-model'
import { CommandStateShape } from '@seleniumhq/side-api/dist/models/state/command'
import React, { FC } from 'react'
import CommandOverlay from '../../Tests/TestCommandOverlay'

const commandTextFormat = { color: 'primary.main', typography: 'body2' }
const argTextFormat = {
  color: 'secondary.main',
  typography: 'subtitle2',
  ml: 2,
}
const errorTextFormat = {
  color: 'error.main',
  typography: 'caption',
  ml: 2,
}

interface SuiteViewerEntryProps {
  command: CommandShape | null
  result: CommandStateShape | null
  test: TestShape
}

const SuiteViewerEntry: FC<SuiteViewerEntryProps> = ({
  command,
  result,
  test,
}) => (
  <ListItem className="pos-rel" divider>
    <ListItemText
      disableTypography
      primary={<Box sx={commandTextFormat}>{test.name}</Box>}
      secondary={
        <>
          <Box sx={argTextFormat}>{command?.command}</Box>
          <Box sx={argTextFormat}>{command?.target}</Box>
          <Box sx={argTextFormat}>{command?.value}</Box>
          <Box sx={errorTextFormat}>{result?.message}</Box>
        </>
      }
    />
    <CommandOverlay state={result?.state ?? null} />
  </ListItem>
)

export default SuiteViewerEntry
