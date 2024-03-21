import React, { FC, useContext } from 'react'
import PlayButton from 'browser/components/Controls/PlayButton'
import RecordButton from 'browser/components/Controls/RecordButton'
import StopButton from 'browser/components/Controls/StopButton'
import PauseButton from 'browser/components/Controls/PauseButton'
import { context } from 'browser/contexts/status'
// import PlayNextStepButton from 'browser/components/Controls/PlayNextStepButton'

const TestControls: FC = () => {
  const status = useContext(context)
  switch (status) {
    case 'idle':
      return (
        <>
          <PlayButton />
          {/*<PlayNextStepButton state={state} test={test} />*/}
          <RecordButton />
        </>
      )
    case 'paused':
      return (
        <>
          <StopButton />
          <PlayButton />
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
          <PlayButton />
          <StopButton />
        </>
      )
  }
}

export default TestControls
