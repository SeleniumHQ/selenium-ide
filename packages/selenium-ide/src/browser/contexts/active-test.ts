import { CoreSessionData } from '@seleniumhq/side-api'
import { defaultSession } from 'browser/helpers/subscribeToSession'
import React from 'react'

type ActiveTestContext = {
  activeSuiteID: string
  activeTestID: string
}

export const transform = (data: CoreSessionData): ActiveTestContext => ({
  activeSuiteID: data.state.activeSuiteID,
  activeTestID: data.state.activeTestID,
})

export const context = React.createContext(
  transform(defaultSession)
)
