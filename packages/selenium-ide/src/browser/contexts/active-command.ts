import {
  CoreSessionData,
  getActiveCommand,
} from '@seleniumhq/side-api'
import { defaultSession } from 'browser/helpers/subscribeToSession'
import React from 'react'

export const transform = (data: CoreSessionData) => {
  const activeCommand = getActiveCommand(data)
  return activeCommand
}

export const context = React.createContext(
  transform(defaultSession)
)
