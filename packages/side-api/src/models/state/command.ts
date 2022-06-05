import { PlaybackEventShapes } from '@seleniumhq/side-runtime'

export type CommandStateShape = PlaybackEventShapes['COMMAND_STATE_CHANGED']

export type CommandsStateShape = Record<string, CommandStateShape>
