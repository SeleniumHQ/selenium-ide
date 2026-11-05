import React, { FC, use } from 'react'
import PauseButton from '../../../../components/Controls/PauseButton'
import PlayListButton from '../../../../components/Controls/PlayListButton'
import StopButton from '../../../../components/Controls/StopButton'
import { context } from 'browser/contexts/status'

const activeStates = ['recording', 'playing']

const SuiteControls: FC = () => {
  const status = use(context)
  return (
    <>
      {activeStates.includes(status) ? (
        <>
          <PauseButton />
          <StopButton />
        </>
      ) : (
        <>
          <PlayListButton />
        </>
      )}
    </>
  )
}

export default SuiteControls
