import React, { FC } from 'react';
import { StateShape } from '@seleniumhq/side-api'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import baseControlProps from './BaseProps'
import { badIndex } from '@seleniumhq/side-api/dist/constants/badIndex'

export interface TaskButtonProps {
    state: StateShape
  }
  const TaskButton: FC<TaskButtonProps> = ({ state }) => (
    <Tooltip title="Task" aria-label="task">
      <IconButton
  {...baseControlProps}
  onClick={() => {
    if (state.playback.currentIndex === badIndex) {
      // 실행하고자 하는 코드
      window.sideAPI.playback.auto(state.activeTestID);
      // 추가적인 코드를 여기에 추가할 수 있습니다.
      // 예를 들어:
      // console.log('Play button clicked');
      // doSomethingElse();
    } else {
      // 실행하고자 하는 코드ß
      window.sideAPI.playback.resume();

      // 추가적인 코드를 여기에 추가할 수 있습니다.
      // 예를 들어:
      // console.log('Resume button clicked');
      // doSomethingElse();
    }
  }}
>
  <PlayArrowIcon />
</IconButton>
    </Tooltip>
  )


export default TaskButton;



