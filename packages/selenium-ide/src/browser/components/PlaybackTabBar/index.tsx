import Paper from '@mui/material/Paper'
import React from 'react'
import PlaybackTab, { TabShape } from './tab'
import IconButton from '@mui/material/IconButton'
import { Add } from '@mui/icons-material'
import baseControlProps from '../Controls/BaseProps'

const {
  windows: { requestPlaybackWindow },
} = window.sideAPI

const PlaybackTabBar: React.FC<{ tabs: TabShape[] }> = ({ tabs }) => (
  <Paper
    className="flex flex-initial flex-row pt-2 width-100 z-1"
    elevation={3}
    square
    sx={{
      height: 38,
    }}
  >
    {tabs.map((tab) => (
      <PlaybackTab key={tab.id} {...tab} />
    ))}
    <IconButton {...baseControlProps} onClick={() => requestPlaybackWindow()}>
      <Add />
    </IconButton>
  </Paper>
)

export default PlaybackTabBar
