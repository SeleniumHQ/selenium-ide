import { CoreSessionData } from 'api/types'
import React from 'react'
import { TAB } from '../enums/tab'

export interface SIDEMainProps {
  session: CoreSessionData
  openDrawer: boolean
  setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>
  setTab: React.Dispatch<React.SetStateAction<TAB>>
  tab: number
}
