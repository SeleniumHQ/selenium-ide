import { CommandShape, SuiteShape, TestShape } from '@seleniumhq/side-model'
import defaultCommand from 'api/models/project/command'
import defaultSuite from 'api/models/project/suite'
import defaultTest from 'api/models/project/test'
import { CoreSessionData } from 'api/types'

const hasID =
  (id2: string) =>
  ({ id }: { id: string }) =>
    id2 === id

export const getActiveSuite = (session: CoreSessionData): SuiteShape => {
  const { project, state: { activeSuiteID } } = session

  return project.suites.find(hasID(activeSuiteID)) || defaultSuite;
}

export const getActiveTest = (session: CoreSessionData): TestShape => {
  const { project, state: { activeTestID } } = session

  return project.tests.find(hasID(activeTestID)) || defaultTest;
}

export const getActiveCommand = (session: CoreSessionData, activeTest?: TestShape): CommandShape => {
  const { state: { activeCommandID } } = session
  const _activeTest = activeTest || getActiveTest(session);
  return _activeTest.commands.find(hasID(activeCommandID)) || defaultCommand;
};

export const getActiveCommandIndex = (session: CoreSessionData, activeTest?: TestShape): number => {
  const { state: { activeCommandID } } = session
  const _activeTest = activeTest || getActiveTest(session);
  return _activeTest.commands.findIndex(hasID(activeCommandID));
};

export const getCommandIndex = (session: CoreSessionData, commandID: string, activeTest?: TestShape): number => {
  const _activeTest = activeTest || getActiveTest(session);
  return _activeTest.commands.findIndex(hasID(commandID));
};
