import { CommandShape } from '@seleniumhq/side-model'
import browserHandler from 'browser/api/classes/Handler'
import update from 'lodash/fp/update'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { getActiveTestIndex } from 'api/helpers/getActiveData'

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

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
