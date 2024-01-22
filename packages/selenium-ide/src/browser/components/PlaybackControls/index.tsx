import Paper from '@mui/material/Paper'
import React from 'react'
import URLBar from '../URLBar'
import PlaybackDimensionControls from '../PlaybackDimensionControls'
import PlaybackTabBar from '../PlaybackTabBar'
import { SIDEMainProps } from '../types'

const PlaybackControls: React.FC<Pick<SIDEMainProps, 'session'>> = ({
  session,
}) => {
  return (
    <div className="flex flex-col flex-initial width-100">
      <div className="flex flex-row flex-initial">
        <Paper className="flex flex-1 height-100 ps-3 z-3" elevation={2} square>
          <URLBar session={session} />
          <Paper
            className="flex flex-initial height-100 flex-row"
            elevation={0}
            square
          >
            <PlaybackDimensionControls session={session} />
          </Paper>
        </Paper>
      </div>
      <PlaybackTabBar />
    </div>
  )
}

export default PlaybackControls
