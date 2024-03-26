import Paper from '@mui/material/Paper'
import React from 'react'
import PlaybackDimensionControls from '../PlaybackDimensionControls'
import PlaybackTabBar from '../PlaybackTabBar'
import { TabShape } from '../PlaybackTabBar/tab'
import URLBar from '../URLBar'

const {
  windows: {
    onPlaybackWindowChanged,
    onPlaybackWindowClosed,
    onPlaybackWindowOpened,
  },
} = window.sideAPI

const tabBarSX = {
  borderBottom: 1,
  borderColor: 'grey.500',
}

const PlaybackControls: React.FC = () => {
  const [tabs, setTabs] = React.useState<TabShape[]>([])
  React.useEffect(() => {
    onPlaybackWindowChanged.addListener((id, partialTab) => {
      setTabs((tabs) => {
        const tab = tabs.find((tab) => tab.id === id)
        if (!tab) return tabs
        return tabs.map((tab) => {
          if (tab.id !== id) return tab
          return {
            ...tab,
            ...partialTab,
          }
        })
      })
    })
    onPlaybackWindowOpened.addListener((id, { test = '', title = '', url }) => {
      setTabs((tabs) => {
        const hasTab = tabs.some((tab) => tab.id === id)
        if (hasTab) {
          return tabs
        }
        return tabs.concat({
          id,
          focused: false,
          test,
          title,
          url,
          visible: false,
        })
      })
    })
    onPlaybackWindowClosed.addListener((id) => {
      setTabs((tabs) => tabs.filter((tab) => tab.id !== id))
    })
  }, [])
  return (
    <Paper className="flex flex-col flex-initial width-100 window-drag">
      <PlaybackTabBar tabs={tabs} />
      <div className="flex flex-row flex-initial no-window-drag">
        <Paper
          className="flex flex-1 height-100 py-2 ps-3 z-3"
          elevation={2}
          square
          sx={tabBarSX}
        >
          <URLBar tab={tabs.find((t) => t.visible) ?? null} />
          <PlaybackDimensionControls />
        </Paper>
      </div>
    </Paper>
  )
}

export default PlaybackControls
