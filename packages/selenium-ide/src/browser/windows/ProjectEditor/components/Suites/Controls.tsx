import { StateShape } from 'api/types'
import React, { FC } from 'react'
import PauseButton from '../Controls/PauseButton'
import PlayListButton from '../Controls/PlayListButton'
import StopButton from '../Controls/StopButton'

export interface SuiteControlsProps {
  state: StateShape
}

const activeStates = ['recording', 'playing']

const SuiteControls: FC<SuiteControlsProps> = ({ state }) => (
  <>
    {activeStates.includes(state.status) ? (
      <>
        <PauseButton />
        <StopButton />
      </>
    ) : (
      <>
        <PlayListButton state={state} />
      </>
    )}
  </>
)

export default SuiteControls
