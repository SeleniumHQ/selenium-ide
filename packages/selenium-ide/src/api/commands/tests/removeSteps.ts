import { CommandShape } from '@seleniumhq/side-model'
import browserHandler from 'browser/api/classes/Handler'
import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { getActiveCommandIndex } from 'api/helpers/getActiveData'
import { hasID } from 'api/helpers/hasID'

export type Shape = (testID: string, stepIndexes: number[]) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, stepIndexes] }
) => {
  const {
    project: { tests },
  } = session
  const testIndex = tests.findIndex(hasID(testID))
  const activeTest = tests[testIndex]
  const commandIndex = getActiveCommandIndex(session, activeTest)
  const sessionWithRemovedCommands = update(
    `project.tests.${testIndex}.commands`,
    (commands: CommandShape[]) =>
      commands.filter((_cmd, index) => !stepIndexes.includes(index)),
    session
  )
  const sessionWithUpdatedSelection = update(
    `state.editor.selectedCommandIndexes`,
    (selectedCommandIndexes: string[]) =>
      selectedCommandIndexes.filter((_id, index) => !stepIndexes.includes(index)),
    sessionWithRemovedCommands
  )
  const newActiveTest = sessionWithUpdatedSelection.project.tests[testIndex]
  return set(
    'state.activeCommandID',
    newActiveTest.commands[
      Math.min(newActiveTest.commands.length - 1, commandIndex)
    ].id,
    sessionWithUpdatedSelection
  )
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
