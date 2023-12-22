import { CommandShape, SuiteShape, TestShape } from '@seleniumhq/side-model'
import { command as defaultCommand } from '../models/project/command'
import { suite as defaultSuite } from '../models/project/suite'
import { test as defaultTest } from '../models/project/test'
import { CoreSessionData } from '../types/base'
import { hasID } from './hasID'

export const getActiveSuite = (session: CoreSessionData): SuiteShape => {
  const {
    project,
    state: { activeSuiteID },
  } = session

  return project.suites.find(hasID(activeSuiteID)) || defaultSuite
}

export const getActiveTest = (session: CoreSessionData): TestShape => {
  const {
    project,
    state: { activeTestID },
  } = session
  return project.tests.find(hasID(activeTestID)) || defaultTest
}

export const getActiveTestIndex = (session: CoreSessionData): number => {
  const {
    project,
    state: { activeTestID },
  } = session
  return project.tests.findIndex(hasID(activeTestID))
}

export const getActiveCommand = (
  session: CoreSessionData,
  activeTest: TestShape = getActiveTest(session)
): CommandShape => {
  const activeCommandIndex = getActiveCommandIndex(session)
  return activeTest.commands[activeCommandIndex] || defaultCommand
}

export const getActiveCommandIndex = (session: CoreSessionData): number => {
  const commands = getActiveTest(session).commands
  if (!commands.length) {
    return -1
  }
  return session.state.editor.selectedCommandIndexes.slice(-1)[0]
}

export const getActiveWindowHandleID = (
  session: CoreSessionData
): null | string => {
  const activeTest = getActiveTest(session)
  const activeIndex = Math.max(0, getActiveCommandIndex(session))
  const commands = activeTest.commands
  for (let i = activeIndex; i >= 0; i--) {
    let item = commands[i]
    if (item.command == 'selectWindow') {
      let target = item.target as string
      return target.substring('handle=${'.length, target.length - 1)
    }
    if (item.command == 'storeWindowHandle') {
      return item.target as string
    }
  }
  return null
}

export const getCommandIndex = (
  session: CoreSessionData,
  commandID: string,
  activeTest: TestShape = getActiveTest(session)
): number => activeTest.commands.findIndex(hasID(commandID))
