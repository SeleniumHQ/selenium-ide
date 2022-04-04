import { ExportCommandShape, ExportCommandsShape } from '../types'

export interface WriteCommandOpts {
  commandPrefixPadding: string
  level: number
}

export const writeCommand = (
  command: ExportCommandShape,
  { commandPrefixPadding, level }: WriteCommandOpts
) =>
  typeof command === 'string'
    ? `${commandPrefixPadding.repeat(level) + command}`
    : `${commandPrefixPadding.repeat(command.level) + command.statement}`

export const writeCommands = (
  commandBlock: ExportCommandsShape,
  opts: WriteCommandOpts
) =>
  commandBlock.commands
    .map((cmd) => writeCommand(cmd, opts))
    .join(`\n${opts.commandPrefixPadding}`)
    .replace(/^/, opts.commandPrefixPadding)
