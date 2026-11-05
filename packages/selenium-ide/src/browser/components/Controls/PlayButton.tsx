import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import React, { FC, use } from 'react'
import { badIndex } from '@seleniumhq/side-api/dist/constants/badIndex'
import baseControlProps from './BaseProps'
import { context as playbackCurrentIndexContext } from 'browser/contexts/playback-current-index'
import { context as activeTestContext } from 'browser/contexts/active-test'
import { FormattedMessage } from 'react-intl'
import languageMap from 'browser/I18N/keys'

const PlayButton: FC = () => {
  const { activeTestID } = use(activeTestContext)
  const currentIndex = use(playbackCurrentIndexContext)
  return (
    <Tooltip
      title={<FormattedMessage id={languageMap.testCore.play} />}
      aria-label="play"
    >
      <IconButton
        {...baseControlProps}
        data-play
        onClick={() => {
          currentIndex === badIndex
            ? window.sideAPI.playback.play(activeTestID)
            : window.sideAPI.playback.resume()
        }}
      >
        <PlayArrowIcon />
      </IconButton>
    </Tooltip>
  )
}

export default PlayButton
