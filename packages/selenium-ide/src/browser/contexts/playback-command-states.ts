import { CommandsStateShape, CoreSessionData } from '@seleniumhq/side-api'
import { defaultSession } from 'browser/helpers/subscribeToSession'
import React from 'react'

export const transform = (data: CoreSessionData) => data.state.playback.commands

export const context = React.createContext<CommandsStateShape>(
  transform(defaultSession)
)
