import omit from 'lodash/fp/omit'
import set from 'lodash/fp/set'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { getActiveTest } from 'api/helpers/getActiveData'
import { CommandShape } from '@seleniumhq/side-model'

export type Shape = () => Promise<void>

export const mutator: Mutator<Shape> = (session) => {
  const selection = session.state.editor.selectedCommands
  const activeTest = getActiveTest(session)
  const selectedCommands: CommandShape[] = activeTest.commands.filter((cmd) =>
    selection.includes(cmd.id)
  )
  const copyFriendlyCommands = selectedCommands.map(omit(['id']))
  return set('state.editor.copiedCommands', copyFriendlyCommands, session)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
