import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import * as ActiveCommand from './active-command'
import * as ActiveTest from './active-test'
import * as ConfigSettingsGroup from './config-settings-group'
import * as Config from './config'
import * as PlaybackCommandStates from './playback-command-states'
import * as PlaybackCurrentIndex from './playback-current-index'
import * as PlaybackTestResults from './playback-test-results'
import * as Session from './session'
import * as ShowDrawer from './show-drawer'
import * as Status from './status'
import * as SuiteMode from './suite-mode'
import * as Suites from './suites'
import * as Tests from './tests'

const contexts = [
  Session,
  ConfigSettingsGroup,
  Config,
  ActiveCommand,
  ActiveTest,
  PlaybackCommandStates,
  PlaybackCurrentIndex,
  PlaybackTestResults,
  ShowDrawer,
  Status,
  SuiteMode,
  Suites,
  Tests,
]

type SessionProvidersProps = {
  children: React.ReactNode
}

export const SessionContextProviders: React.FC<SessionProvidersProps> = ({
  children,
}) => {
  const session = subscribeToSession()
  return contexts.reduceRight((children, { context, transform }) => {
    // @ts-expect-error meh idk
    return <context.Provider value={transform(session)}>{children}</context.Provider>
  }, children)
}
