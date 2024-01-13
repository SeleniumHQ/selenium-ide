import { CoreSessionData } from '@seleniumhq/side-api'
import React from 'react'
import { TAB } from '../enums/tab'

export interface SIDEMainProps {
  session: CoreSessionData
  setTab: React.Dispatch<React.SetStateAction<TAB>>
  tab: number
}
