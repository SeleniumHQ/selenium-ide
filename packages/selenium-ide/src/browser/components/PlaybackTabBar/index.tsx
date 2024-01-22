import Paper from '@mui/material/Paper'
import React from 'react'
import PlaybackTab, { TabShape } from './tab'

const {
  windows: {
    onPlaybackWindowChanged,
    onPlaybackWindowClosed,
    onPlaybackWindowOpened,
  },
} = window.sideAPI

const PlaybackTabBar: React.FC = () => {
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
    });
    onPlaybackWindowOpened.addListener((id, {title}) => {
      setTabs((tabs) => [...tabs, { id, focused: false, title }])
    });
    onPlaybackWindowClosed.addListener((id) => {
      setTabs((tabs) => tabs.filter((tab) => tab.id !== id))
    });
  }, []);
  return (
    <Paper
      className="flex flex-initial flex-row px-3 width-100 z-1"
      elevation={3}
      square
      sx={{
        height: 40,
      }}
    >
      {tabs.map((tab) => (
        <PlaybackTab key={tab.id} {...tab} />
      ))}
    </Paper>
  )
}

export default PlaybackTabBar
