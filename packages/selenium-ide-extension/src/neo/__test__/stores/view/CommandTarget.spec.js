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

import CommandTarget from '../../../stores/view/CommandTarget'
import Command from '../../../models/Command'
import UiState from '../../../stores/view/UiState'
jest.mock('../../../stores/view/UiState')
jest.mock('../../../stores/view/PlaybackState')
jest.mock('../../../stores/view/Logs')

describe('CommandTarget', () => {
  let commandTarget
  let command
  let controls

  beforeEach(() => {
    commandTarget = new CommandTarget()
    command = new Command(undefined, 'a', '', '')
    controls = {
      breakOnNextCommand: false,
      playToThisPoint: true,
      recordFromHere: false,
    }
  })
  it('stores command reference and sets metadata', () => {
    commandTarget.load(command, controls)
    expect(commandTarget.is.playToThisPoint).toBeTruthy()
    expect(commandTarget.is.recordFromHere).toBeFalsy()
    expect(commandTarget._command).toEqual(command)
  })
  it('toggles command breakpoint', () => {
    commandTarget._command = command
    commandTarget._toggleBreakpoint()
    expect(commandTarget._command.isBreakpoint).toBeTruthy()
  })
  it('load toggles command breakpoint depending on metadata', () => {
    commandTarget.load(command, controls)
    expect(commandTarget._command.isBreakpoint).toBe(true)
  })
  it('resets state to sensible defaults and untoggles command breakpoint', () => {
    commandTarget.load(command, controls)
    commandTarget._reset()
    expect(commandTarget._command).toBeFalsy()
    expect(commandTarget.is.playToThisPoint).toBeFalsy()
    expect(commandTarget.is.visited).toBeFalsy()
    expect(command.isBreakpoint).toBeFalsy()
  })
  it('doPlayToThisPoint toggles breakpoint and marks command as visited when correct metadata is loaded', () => {
    let _controls = {}
    commandTarget.load(command, _controls)
    expect(command.isBreakpoint).toBeFalsy()
    expect(commandTarget.is.playToThisPoint).toBeFalsy()
    commandTarget.doPlayToThisPoint()
    expect(commandTarget.is.visited).toBeFalsy()

    _controls = { playToThisPoint: true }
    commandTarget.load(command, _controls)
    expect(command.isBreakpoint).toBeTruthy()
    expect(commandTarget.is.playToThisPoint).toBeTruthy()
    commandTarget.doPlayToThisPoint()
    expect(command.isBreakpoint).toBeFalsy()
    expect(commandTarget.is.visited).toBeTruthy()
  })
  it('doRecordFromHere starts recording and marks command as visited when correct metadata is loaded', async () => {
    let _controls = {}
    commandTarget.load(command, _controls)
    expect(commandTarget.is.visited).toBeFalsy()
    expect(command.isBreakpoint).toBeFalsy()
    expect(UiState.isRecording).toBeFalsy()
    commandTarget.doRecordFromHere()
    expect(commandTarget.is.visited).toBeFalsy()
    expect(UiState.isRecording).toBeFalsy()
    expect(command.isBreakpoint).toBeFalsy()

    _controls = { recordFromHere: true }
    commandTarget.load(command, _controls)
    expect(commandTarget.is.visited).toBeFalsy()
    expect(command.isBreakpoint).toBeTruthy()
    expect(UiState.isRecording).toBeFalsy()
    await commandTarget.doRecordFromHere()
    expect(commandTarget.is.visited).toBeTruthy()
    expect(UiState.isRecording).toBeTruthy()
    expect(command.isBreakpoint).toBeFalsy()
  })
  it('log if the command was not visited', () => {
    commandTarget._alert()
    expect(commandTarget._logMessage).toBeFalsy()
    commandTarget.load(command, controls)
    commandTarget._alert()
    expect(typeof commandTarget._logMessage).toEqual('string')
  })
  it('do not log if the test is aborted', () => {
    const commandTarget = new CommandTarget()
    commandTarget.load(command, controls)
    commandTarget._alert({ isTestAborted: true })
    expect(commandTarget._logMessage).toBeFalsy()
    commandTarget.doCleanup({ isTestAborted: true })
    expect(commandTarget._logMessage).toBeFalsy()
  })
  it('doCleanup resets state and logs if the command was not visited', () => {
    commandTarget.load(command, controls)
    commandTarget._alert()
    commandTarget.doCleanup({ isTestAborted: true })
    expect(commandTarget._command).toBeFalsy()
    expect(commandTarget.is.playToThisPoint).toBeFalsy()
    expect(commandTarget.is.recordFromHere).toBeFalsy()
    expect(commandTarget.is.visited).toBeFalsy()
    expect(commandTarget._logMessage).toBeFalsy()
    expect(command.isBreakpoint).toBeFalsy()
  })
})
