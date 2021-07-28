import { CommandShape } from 'api/types'
import React, { Dispatch, FC, SetStateAction } from 'react'
import getEntryColor from 'browser/helpers/getEntryColor'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'

export interface CommandListProps {
  activeCommand: string
  setActiveCommand: Dispatch<SetStateAction<string>>
  commands: CommandShape[]
}

const CommandList: FC<CommandListProps> = ({
  activeCommand,
  commands,
  setActiveCommand,
}) => (
  <TableContainer
    className="flex-1 overflow-y bt"
    sx={{ borderColor: 'primary.main' }}
  >
    <Table size="small" aria-label="commands-list">
      <TableHead>
        <TableRow>
          <TableCell>Command</TableCell>
          <TableCell>Target</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {commands.map(({ command, id, target, value }) => (
          <TableRow
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
)

export default CommandList
