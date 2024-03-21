import { ConfigSettingsGroup, CoreSessionData } from '@seleniumhq/side-api'
import { defaultSession } from 'browser/helpers/subscribeToSession'
import React from 'react'

export const transform = (data: CoreSessionData) =>
  data.state.editor.configSettingsGroup

export const context = React.createContext<ConfigSettingsGroup>(
  transform(defaultSession)
)
