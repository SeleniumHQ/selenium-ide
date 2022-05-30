import { CommandShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { Mutator } from '../../types'
import { getActiveTestIndex } from '../../helpers/getActiveData'

/**
 * Disable or enable a step
 */
export type Shape = (disable: boolean) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [disable] }) => {
  const selectedCommandIndexes = session.state.editor.selectedCommandIndexes
  const activeTestIndex = getActiveTestIndex(session)
  return update(
    `project.tests.${activeTestIndex}.commands`,
    (commands: CommandShape[]) =>
      commands.map((cmd, index) => {
        if (!selectedCommandIndexes.includes(index)) {
          return cmd
        }
        const isDisabled = cmd.command.startsWith('//')
        if (disable === isDisabled) return cmd
        const flipCommand = cmd.command.startsWith('//')
          ? cmd.command.slice(2)
          : `//${cmd.command}`
        return {
          ...cmd,
          command: flipCommand,
        }
      }),
    session
  )
}
