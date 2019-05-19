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

import { validateControlFlowSyntax } from '../../../playback/playback-tree/syntax-validation'
import Command, { ControlFlowCommandNames } from '../../../models/Command'

function createCommand(name) {
  return new Command(null, name, '', '')
}

describe('Control Flow', () => {
  describe('Preprocess', () => {
    describe('Syntax Validation', () => {
      test('if, end', () => {
        let result = validateControlFlowSyntax([
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.end),
        ])
        expect(result).toBeTruthy()
      })
      test('if, else, end', () => {
        let result = validateControlFlowSyntax([
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.end),
        ])
        expect(result).toBeTruthy()
      })
      test('if, elseIf, end', () => {
        let result = validateControlFlowSyntax([
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.elseIf),
          createCommand(ControlFlowCommandNames.end),
        ])
        expect(result).toBeTruthy()
      })
      test('if, elseIf, else, end', () => {
        let result = validateControlFlowSyntax([
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.elseIf),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.end),
        ])
        expect(result).toBeTruthy()
      })
      test('while, end', () => {
        let result = new validateControlFlowSyntax([
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.end),
        ])
        expect(result).toBeTruthy()
      })
      test('times, end', () => {
        let result = validateControlFlowSyntax([
          createCommand('times'),
          createCommand(ControlFlowCommandNames.end),
        ])
        expect(result).toBeTruthy()
      })
      test('do, repeatIf', () => {
        let result = validateControlFlowSyntax([
          createCommand(ControlFlowCommandNames.do),
          createCommand(ControlFlowCommandNames.repeatIf),
        ])
        expect(result).toBeTruthy()
      })
      test('do, while, end, repeatIf', () => {
        let result = validateControlFlowSyntax([
          createCommand(ControlFlowCommandNames.do),
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.repeatIf),
        ])
        expect(result).toBeTruthy()
      })
    })
    describe('Syntax Invalidation', () => {
      test('if', () => {
        let input = [createCommand(ControlFlowCommandNames.if)]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Incomplete block at if')
      })
      test('if, if, end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.end),
        ]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Incomplete block at if')
      })
      test('if, else, elseIf, end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.elseIf),
          createCommand(ControlFlowCommandNames.end),
        ]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Incorrect command order of else if / else')
      })
      test('if, else, else, end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.end),
        ]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Too many else commands used')
      })
      test('else', () => {
        let input = [createCommand(ControlFlowCommandNames.else)]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('An else used outside of an if block')
      })
      test('else, else', () => {
        let input = [
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.else),
        ]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('An else used outside of an if block')
      })
      test('elseIf', () => {
        let input = [createCommand(ControlFlowCommandNames.elseIf)]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('An else if used outside of an if block')
      })
      test('while', () => {
        let input = [createCommand(ControlFlowCommandNames.while)]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Incomplete block at while')
      })
      test('if, while', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.while),
        ]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Incomplete block at while')
      })
      test('if, while, end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.end),
        ]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Incomplete block at if')
      })
      test('if, while, else, end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.end),
        ]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('An else used outside of an if block')
      })
      test('times', () => {
        let input = [createCommand('times')]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Incomplete block at times')
      })
      test('forEach', () => {
        let input = [createCommand(ControlFlowCommandNames.forEach)]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow(`Incomplete block at ${ControlFlowCommandNames.forEach}`)
      })
      test('repeatIf', () => {
        let input = [createCommand(ControlFlowCommandNames.repeatIf)]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('A repeat if used without a do block')
      })
      test('do', () => {
        let input = [createCommand(ControlFlowCommandNames.do)]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Incomplete block at do')
      })
      test('end', () => {
        let input = [createCommand(ControlFlowCommandNames.end)]
        expect(function() {
          validateControlFlowSyntax(input)
        }).toThrow('Use of end without an opening keyword')
      })
    })
  })
})
