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

import Command, { ControlFlowCommandNames } from '../../../models/Command'
import { deriveCommandLevels } from '../../../playback/playback-tree/command-leveler'

function createCommand(name) {
  return new Command(null, name, '', '')
}

describe('Control Flow', () => {
  describe('Preprocess', () => {
    describe('Leveling', () => {
      test('returns leveled command stack', () => {
        let stack = deriveCommandLevels([
          createCommand(ControlFlowCommandNames.if),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.while),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.do),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.while),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.repeatIf),
          createCommand(ControlFlowCommandNames.end),
        ])
        expect(stack[0]).toEqual(0) //  if
        expect(stack[1]).toEqual(1) //    command
        expect(stack[2]).toEqual(0) //  else
        expect(stack[3]).toEqual(1) //    while
        expect(stack[4]).toEqual(2) //      command
        expect(stack[5]).toEqual(1) //    end
        expect(stack[6]).toEqual(1) //    do
        expect(stack[7]).toEqual(2) //      command
        expect(stack[8]).toEqual(2) //      while
        expect(stack[9]).toEqual(3) //        command
        expect(stack[10]).toEqual(2) //     end
        expect(stack[11]).toEqual(1) //   repeatIf
        expect(stack[12]).toEqual(0) //  end
      })
    })
  })
})
