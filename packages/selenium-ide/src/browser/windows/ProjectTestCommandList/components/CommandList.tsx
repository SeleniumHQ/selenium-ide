import { CommandShape } from '@seleniumhq/side-model'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { Paper } from '@material-ui/core'
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
            <TableCell>Command</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </Paper>
    <div style={{ height: 50 }} />
    <TableContainer className="width-100" sx={{ borderColor: 'primary.main' }}>
      <Table size="small" aria-label="commands-list">
        <TableBody>
          {commands.map(({ command, id, target, value }) => (
            <TableRow
              className={classNameFromCommandState(commandStates[id])}
              key={id}
              onClick={() => setActiveCommand(id)}
              selected={id === activeCommand}
            >
              <TableCell>{command}</TableCell>
              <TableCell>{target}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
)

export default CommandList
