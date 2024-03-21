import { CoreSessionData } from '@seleniumhq/side-api'
import { defaultSession } from 'browser/helpers/subscribeToSession'
import React from 'react'

type ConfigShape = {
  project: {
    delay?: number
    name: string
    plugins: string[]
    url: string
  }
  system: CoreSessionData['state']['userPrefs']
}

export const transform = (data: CoreSessionData): ConfigShape => ({
  project: {
    delay: data.project.delay,
    name: data.project.name,
    plugins: data.project.plugins,
    url: data.project.url,
  },
  system: data.state.userPrefs,
})

export const context = React.createContext<ConfigShape>(
  transform(defaultSession)
)
