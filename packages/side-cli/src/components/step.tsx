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
  const children = `${command.command} | ${command.target} | ${command.value}`
  const state = result ? result.state : undefined
  return (
    <Box>
      {(state === CommandStates.EXECUTING ||
        state === CommandStates.PENDING) && (
        <PendingStep>{children}</PendingStep>
      )}
      {state === CommandStates.PASSED && <PassedStep>{children}</PassedStep>}
      {state === CommandStates.UNDETERMINED && (
        <UndeterminedStep>{children}</UndeterminedStep>
      )}
      {(state === CommandStates.FAILED || state === CommandStates.ERRORED) && (
        <FailedStep>{children}</FailedStep>
      )}
      {!state && <NoStateStep>{children}</NoStateStep>}
    </Box>
  )
}

const PendingStep: React.FC = (props) => {
  return (
    <>
      {'  '}
      <Text color="yellow">
        <Spinner type="dots" />
      </Text>{' '}
      {props.children}
    </>
  )
}

const PassedStep: React.FC = (props) => {
  return (
    <>
      {'  '}
      <Text color="green">✓</Text> {props.children}
    </>
  )
}

const FailedStep: React.FC = (props) => {
  return (
    <>
      {'  '}
      <Text color="red">✕</Text> {props.children}
    </>
  )
}

const UndeterminedStep: React.FC = (props) => {
  return (
    <>
      {'  '}
      <Text color="yellowBright">○</Text> {props.children}
    </>
  )
}

const NoStateStep: React.FC = (props) => {
  return (
    <>
      {'    '}
      {props.children}
    </>
  )
}

export default Step
