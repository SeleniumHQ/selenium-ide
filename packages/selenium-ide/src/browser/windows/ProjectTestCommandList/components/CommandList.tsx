import { CommandShape } from '@seleniumhq/side-model'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { Box, Divider, Paper, Typography } from '@material-ui/core'
import { CommandsStateShape } from 'api/models/state/command'
import sideAPI from 'browser/helpers/getSideAPI'
import React, { FC } from 'react'

export interface CommandListProps {
  activeCommand: string
  commands: CommandShape[]
  commandStates: CommandsStateShape
}

const {
  state: { setActiveCommand },
} = sideAPI

const classNameFromCommandState = (
  state: PlaybackEventShapes['COMMAND_STATE_CHANGED']['state']
) => {
  if (!state) {
    return ''
  }
  return `command-state-${state}`
}

const camelToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

const CommandList: FC<CommandListProps> = ({
  activeCommand,
  commandStates,
  commands,
}) => (
  <>
    <Paper
      className="p-fixed opaque width-100"
      elevation={3}
      square
      sx={{ top: 11 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Commands</TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </Paper>
    <div style={{ height: 50 }} />
    <TableContainer className="width-100" sx={{ borderColor: 'primary.main' }}>
      <Table size="small" aria-label="commands-list">
        <TableBody>
          {commands.map(({ command, id, target, value }, index) => (
            <TableRow
              className={classNameFromCommandState(commandStates[id])}
              key={id}
              onClick={() => setActiveCommand(id)}
              selected={id === activeCommand}
            >
              {index === 0 ? null : <Divider />}
              <Typography>
                <Box sx={{ typography: 'body1', ml: 1 }}>{camelToTitleCase(command)}</Box>
                {target ? <Divider variant="middle" /> : null}
                <Box sx={{ typography: 'body2', ml: 2 }}>{target}</Box>
                {value ? <Divider variant="middle" /> : null}
                <Box sx={{ typography: 'body2', ml: 2 }}>{value}</Box>
              </Typography>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
)

export default CommandList
