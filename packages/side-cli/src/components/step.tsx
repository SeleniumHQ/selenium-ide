// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React from 'react'
import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import { CommandStates, CommandState } from '@seleniumhq/side-runtime'
import { CommandShape } from '@seleniumhq/side-model'

export interface StepProps {
  command: CommandShape
  result?: { state: CommandState }
}

const Step: React.FC<StepProps> = ({ command, result }) => {
  const TextBody = (
    <Text>
      {command.command} | {command.target} | {command.value}
    </Text>
  )
  const state = result ? result.state : undefined
  return (
    <Box>
      {(state === CommandStates.EXECUTING ||
        state === CommandStates.PENDING) && (
        <>
          <PendingStep />
          {TextBody}
        </>
      )}
      {state === CommandStates.PASSED && (
        <>
          <PassedStep />
          {TextBody}
        </>
      )}
      {state === CommandStates.UNDETERMINED && (
        <>
          <UndeterminedStep />
          {TextBody}
        </>
      )}
      {(state === CommandStates.FAILED || state === CommandStates.ERRORED) && (
        <>
          <FailedStep />
          {TextBody}
        </>
      )}
      {!state && (
        <>
          <NoStateStep />
          {TextBody}
        </>
      )}
    </Box>
  )
}

const PendingStep: React.FC = () => {
  return (
    <Text color="yellow">
      &nbsp;&nbsp;
      <Spinner type="dots" />
    </Text>
  )
}

const PassedStep: React.FC = () => {
  return <Text color="green">&nbsp;&nbsp;✓</Text>
}

const FailedStep: React.FC = () => {
  return <Text color="red">&nbsp;&nbsp;✕</Text>
}

const UndeterminedStep: React.FC = () => {
  return <Text color="yellowBright">&nbsp;&nbsp;○</Text>
}

const NoStateStep: React.FC = () => {
  return <Text>&nbsp;&nbsp;&nbsp;&nbsp;</Text>
}

export default Step
