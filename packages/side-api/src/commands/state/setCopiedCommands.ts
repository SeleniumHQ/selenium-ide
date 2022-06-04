import omit from 'lodash/fp/omit'
import set from 'lodash/fp/set'
import { Mutator } from '../../types'
import { getActiveTest } from '../../helpers/getActiveData'
import { CommandShape } from '@seleniumhq/side-model'

/**
 * Copy commands from the selected commands list
 */
export type Shape = () => Promise<void>

export const mutator: Mutator<Shape> = (session) => {
  const selection = session.state.editor.selectedCommandIndexes
  const activeTest = getActiveTest(session)
  const selectedCommandIndexes: CommandShape[] = activeTest.commands.filter(
    (_cmd, index) => selection.includes(index)
  )
  const copyFriendlyCommands = selectedCommandIndexes.map(omit(['id']))
  return set('state.editor.copiedCommands', copyFriendlyCommands, session)
}
