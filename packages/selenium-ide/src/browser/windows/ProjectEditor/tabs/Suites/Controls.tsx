import { StateShape } from '@seleniumhq/side-api'
import React, { FC } from 'react'
import PauseButton from '../../../../components/Controls/PauseButton'
import PlayListButton from '../../../../components/Controls/PlayListButton'
import StopButton from '../../../../components/Controls/StopButton'

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
