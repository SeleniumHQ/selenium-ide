import { CommandShape, SuiteShape, TestShape } from '@seleniumhq/side-model'
import defaultCommand from 'api/models/project/command'
import defaultSuite from 'api/models/project/suite'
import defaultTest from 'api/models/project/test'
import { CoreSessionData } from 'api/types'
import { useMemo } from 'react'

const hasID =
  (id2: string) =>
  ({ id }: { id: string }) =>
    id2 === id

export const getActiveSuite = (session: CoreSessionData): SuiteShape => {
  const { project, state: { activeSuiteID } } = session

  return useMemo(
    () => project.suites.find(hasID(activeSuiteID)) || defaultSuite,
    [activeSuiteID, project.id]
  )
}

export const getActiveTest = (session: CoreSessionData): TestShape => {
  const { project, state: { activeTestID } } = session

  return useMemo(
    () => project.tests.find(hasID(activeTestID)) || defaultTest,
    [activeTestID, project.id]
  )
}

export const getActiveCommand = (session: CoreSessionData, activeTest?: TestShape): CommandShape => {
  const { state: { activeCommandID } } = session
  const _activeTest = activeTest || getActiveTest(session);
  return useMemo(
    () => _activeTest.commands.find(hasID(activeCommandID)) || defaultCommand,
    [activeCommandID, _activeTest.id]
  )
};
