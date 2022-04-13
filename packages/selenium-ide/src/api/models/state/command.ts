import { PlaybackEventShapes } from '@seleniumhq/side-runtime'

export type CommandsStateShape = Record<
  string,
  PlaybackEventShapes['COMMAND_STATE_CHANGED']
>
