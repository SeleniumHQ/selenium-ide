import { CoreSessionData } from '@seleniumhq/side-api'
import { defaultSession } from 'browser/helpers/subscribeToSession'
import React from 'react'

export const transform = (data: CoreSessionData) => {
  return data.state.editor.suiteMode
}

export const context = React.createContext(transform(defaultSession))
