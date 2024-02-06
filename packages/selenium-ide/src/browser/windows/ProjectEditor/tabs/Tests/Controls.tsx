import { StateShape, TestShape } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import PlayButton from 'browser/components/Controls/PlayButton'
import RecordButton from 'browser/components/Controls/RecordButton'
import StopButton from 'browser/components/Controls/StopButton'
import PauseButton from 'browser/components/Controls/PauseButton'
// import PlayNextStepButton from 'browser/components/Controls/PlayNextStepButton'

export interface TestControlsProps {
  state: StateShape
  test: TestShape
}

const TestControls: FC<TestControlsProps> = ({ state/*, test*/ }) => {
  switch (state.status) {
    case 'idle':
      return (
        <>
          <PlayButton state={state} />
          {/*<PlayNextStepButton state={state} test={test} />*/}
          <RecordButton />
        </>
      )
    case 'paused':
      return (
        <>
          <StopButton />
          <PlayButton state={state} />
          {/*<PlayNextStepButton state={state} test={test} />*/}
          <RecordButton />
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
          <StopButton />
        </>
      )
  }
}

export default TestControls
