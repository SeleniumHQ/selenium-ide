import SkipNextIcon from '@mui/icons-material/SkipNext'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { StateShape, TestShape } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import { badIndex } from '@seleniumhq/side-api/dist/constants/badIndex'
import baseControlProps from './BaseProps'

export interface PlayNextStepButtonProps {
  state: StateShape
  test: TestShape
}

const PlayNextStepButton: FC<PlayNextStepButtonProps> = ({ state, test }) => {
  const selectedCommandIndex = React.useMemo(() => {
    const selectedCommandIndexes = state.editor.selectedCommandIndexes
    if (selectedCommandIndexes.length !== 1) {
      return badIndex
    }
    return selectedCommandIndexes[0]
  }, [state])
  const testLastIndex = React.useMemo(() => {
    return test.commands.length - 1
  }, [test])
  const disabled = React.useMemo(() => {
    if (selectedCommandIndex === badIndex) {
      return true
    }
    if (selectedCommandIndex === testLastIndex) {
      return true
    }
    return false
  }, [selectedCommandIndex, testLastIndex])
  return (
    <Tooltip title="Play Next Step" aria-label="play-next-step">
      <IconButton
        {...baseControlProps}
        data-play-next-step
        disabled={disabled}
        onClick={() => {
          window.sideAPI.playback.play(state.activeTestID, [
            selectedCommandIndex,
            selectedCommandIndex + 1,
          ])
        }}
      >
        <SkipNextIcon />
      </IconButton>
    </Tooltip>
  )
}

export default PlayNextStepButton
