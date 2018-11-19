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
  it('inits with sensible defaults', () => {
    const commandTarget = new CommandTarget()
    expect(commandTarget.command).toBeUndefined()
    expect(commandTarget.is).toEqual({})
  })
  it('stores command reference and sets metadata', () => {
    commandTarget.load(command, controls)
    expect(commandTarget.is.playToThisPoint).toEqual(true)
    expect(commandTarget.is.recordFromHere).toEqual(false)
    expect(commandTarget.command).toEqual(command)
  })
  it('toggles command breakpoint', () => {
    commandTarget.command = command
    commandTarget._toggleBreakpoint()
    expect(commandTarget.command.isBreakpoint).toEqual(true)
  })
  it('load toggles command breakpoint depending on metadata', () => {
    commandTarget.load(command, controls)
    expect(commandTarget.command.isBreakpoint).toBe(true)
  })
  it('resets state to sensible defaults and untoggles command breakpoint', () => {
    commandTarget.load(command, controls)
    commandTarget._reset()
    expect(commandTarget.command).toBeUndefined()
    expect(commandTarget.is.playToThisPoint).toBeFalsy()
    expect(commandTarget.is.visited).toBeFalsy()
    expect(command.isBreakpoint).toEqual(false)
  })
  it('doPlayToThisPoint toggles breakpoint and marks command as visited when correct metadata is loaded', () => {
    let _controls = {}
    commandTarget.load(command, _controls)
    commandTarget.doPlayToThisPoint()
    expect(commandTarget.is.playToThisPoint).toBeUndefined()
    expect(commandTarget.is.visited).toBeFalsy()
    expect(commandTarget.command).toBeDefined()
    expect(command.isBreakpoint).toEqual(false)
    _controls = { playToThisPoint: true }
    commandTarget.load(command, _controls)
    expect(command.isBreakpoint).toEqual(true)
    commandTarget.doPlayToThisPoint()
    expect(commandTarget.is.playToThisPoint).toBeTruthy()
    expect(commandTarget.is.visited).toBeTruthy()
    expect(commandTarget.command).toBeDefined()
    expect(command.isBreakpoint).toEqual(false)
  })
  it('doRecordFromHere marks command as visited and starts recording when correct metadata is loaded', async () => {
    const _controls = { recordFromHere: true }
    commandTarget.load(command, _controls)
    expect(commandTarget.command).toBeDefined()
    expect(command.isBreakpoint).toEqual(true)
    expect(commandTarget.is.recordFromHere).toBeTruthy()
    expect(commandTarget.is.visited).toBeFalsy()
    await commandTarget.doRecordFromHere()
    expect(commandTarget.command).toBeDefined()
    expect(commandTarget.is.recordFromHere).toBeTruthy()
    expect(commandTarget.is.visited).toBeTruthy()
    expect(command.isBreakpoint).toEqual(false)
    expect(UiState.isRecording).toBe(true)
  })
  it('log if the command was not visited', () => {
    class Logger {
      warn(message) {
        this.message = message
      }
    }
    let commandTarget = new CommandTarget(new Logger())
    commandTarget.load(command, controls)
    commandTarget._alert()
    expect(commandTarget.logger.message).toEqual(
      'Unable to play to target command. Likely because it is in a control flow branch that was not executed during playback.'
    )
    commandTarget.doCleanup()
    expect(commandTarget.logger.message).toEqual(
      'Unable to play to target command. Likely because it is in a control flow branch that was not executed during playback.'
    )
  })
  it('do not log if the test is aborted', () => {
    class Logger {
      warn(message) {
        this.message = message
      }
    }
    const commandTarget = new CommandTarget(new Logger())
    commandTarget.load(command, controls)
    commandTarget._alert({ isTestAborted: true })
    expect(commandTarget.logger.message).toBeUndefined()
    commandTarget.doCleanup({ isTestAborted: true })
    expect(commandTarget.logger.message).toBeUndefined()
  })
  it('doCleanup resets state and logs if the command was not visited', () => {
    commandTarget.load(command, controls)
    commandTarget.doCleanup({ isTestAborted: true })
    expect(commandTarget.command).toBeUndefined()
    expect(commandTarget.is.playToThisPoint).toBeFalsy()
    expect(commandTarget.is.recordFromHere).toBeFalsy()
    expect(commandTarget.is.visited).toBeFalsy()
    expect(command.isBreakpoint).toEqual(false)
  })
})
