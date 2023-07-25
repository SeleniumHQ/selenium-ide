import { StateShape } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import PlayButton from '../../components/Controls/PlayButton'
import RecordButton from '../../components/Controls/RecordButton'
import StopButton from '../../components/Controls/StopButton'
import PauseButton from '../../components/Controls/PauseButton'
import PlayListButton from '../../components/Controls/PlayListButton'
import TaskButton from '../../components/Controls/TaskButton'


export interface TestControlsProps {
  state: StateShape
}

const TestControls: FC<TestControlsProps> = ({ state }) => {
  switch (state.status) {
    case 'idle':
      return (
        <>
          <PlayButton state= {state} />
        
          {!state.activeSuiteID ? null : <PlayListButton state={state} />}
          <RecordButton />
          <TaskButton state= {state}/> 
         
        </>
      )
    case 'paused':
      return (
        <>
          <PlayButton state={state} />
          <RecordButton />
          <StopButton />
          <TaskButton state= {state}/> 
         
        </>
      )
    case 'playing':
      return (
        <>
          <StopButton />
          <PauseButton />
          <RecordButton />
        </>
      )
    case 'recording':
      return (
        <>
          <PlayButton state={state} />
          <TaskButton state= {state}/> 
          <StopButton />
          
        </>
      )
  }
}

export default TestControls
