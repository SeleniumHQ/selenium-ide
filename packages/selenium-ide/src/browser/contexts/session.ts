import { CoreSessionData } from '@seleniumhq/side-api'
import { defaultSession } from 'browser/helpers/subscribeToSession'
import React from 'react'

export const transform = (data: CoreSessionData) => {
  return data
}

export const context = React.createContext<CoreSessionData>(
  transform(defaultSession)
)
