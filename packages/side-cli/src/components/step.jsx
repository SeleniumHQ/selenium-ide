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
import { Box, Color } from 'ink'
import Spinner from 'ink-spinner'
import { CommandStates } from '@seleniumhq/side-runtime'

export default class Step extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    const children = `${this.props.command.command} | ${this.props.command.target} | ${this.props.command.value}`
    const state = this.props.result ? this.props.result.state : undefined
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
        {(state === CommandStates.FAILED ||
          state === CommandStates.ERRORED) && (
          <FailedStep>{children}</FailedStep>
        )}
        {!state && <NoStateStep>{children}</NoStateStep>}
      </Box>
    )
  }
}

function PendingStep(props) {
  return (
    <>
      {'  '}
      <Color yellow>
        <Spinner type="dots" />
      </Color>{' '}
      {props.children}
    </>
  )
}

function PassedStep(props) {
  return (
    <>
      {'  '}
      <Color green>✓</Color> {props.children}
    </>
  )
}

function FailedStep(props) {
  return (
    <>
      {'  '}
      <Color red>✕</Color> {props.children}
    </>
  )
}

function UndeterminedStep(props) {
  return (
    <>
      {'  '}
      <Color orange>○</Color> {props.children}
    </>
  )
}

function NoStateStep(props) {
  return (
    <>
      {'    '}
      {props.children}
    </>
  )
}
