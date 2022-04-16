import difference from 'lodash/difference'
import uniq from 'lodash/uniq'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { getActiveTest } from 'api/helpers/getActiveData'
import { mutator as setActiveCommand } from './setActiveCommand'

export type Shape = (
  commandID: string,
  batch: boolean,
  add: boolean,
  clear: boolean
) => Promise<void>

export const browser = browserHandler<Shape>()

export const mutator: Mutator<Shape> = (
  session,
  { params: [commandID, batch, add, clear] }
) => {
  const newSession = update(
    `state.editor.selectedCommands`,
    (commands: string[]) => {
      let commandIDs = [commandID]
      if (clear) {
        return [commandID]
      }
      if (batch) {
        const activeTest = getActiveTest(session)
        const commandIndex = activeTest.commands.findIndex(
          (cmd) => cmd.id === commandID
        )
        const activeCommandIndex = activeTest.commands.findIndex(
          (cmd) => cmd.id === session.state.activeCommandID
        )
        const min = Math.min(commandIndex, activeCommandIndex)
        const max = Math.max(commandIndex, activeCommandIndex) + 1
        commandIDs = activeTest.commands.slice(min, max).map((cmd) => cmd.id)
      }
      if (add) {
        return uniq(commands.concat(commandIDs))
      }
      return difference(commands, commandIDs)
    },
    session
  )
  if (add || clear) {
    return setActiveCommand(newSession, { params: [commandID], result: true })
  } else if (
    !add &&
    !newSession.state.editor.selectedCommands.includes(
      session.state.activeCommandID
    )
  ) {
    return setActiveCommand(newSession, { params: [''], result: true })
  } else {
    return newSession
  }
}

export const main = mainHandler<Shape>(passthrough)
