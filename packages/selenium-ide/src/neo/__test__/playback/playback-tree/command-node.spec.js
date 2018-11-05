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
import { CommandNode } from '../../../playback/playback-tree/command-node'

describe('Command Node', () => {
  it('control flow check returns correct result', () => {
    let node = new CommandNode(undefined)
    node.right = 'asdf'
    expect(node.isControlFlow()).toBeTruthy()
    node.left = undefined
    node.right = 'asdf'
    expect(node.isControlFlow()).toBeTruthy()
  })
  it('retry limit defaults to 1000', () => {
    const command = new Command(
      undefined,
      ControlFlowCommandNames.times,
      '',
      ''
    )
    const node = new CommandNode(command)
    node.timesVisited = 999
    expect(node._isRetryLimit()).toBeFalsy()
    node.timesVisited = 1000
    expect(node._isRetryLimit()).toBeTruthy()
  })
  it('retry limit can be overriden', () => {
    const command = new Command(
      undefined,
      ControlFlowCommandNames.repeatIf,
      '',
      5
    )
    const node = new CommandNode(command)
    node.timesVisited = 5
    expect(node._isRetryLimit()).toBeTruthy()
  })
  it('execute resolves with an error message when too many retries attempted in a loop', () => {
    const command = new Command(undefined, ControlFlowCommandNames.while, '', 2)
    const node = new CommandNode(command)
    node.timesVisited = 3
    node.execute().then(result => {
      expect(result.result).toEqual(
        'Max retry limit exceeded. To override it, specify a new limit in the value input field.'
      )
    })
  })
  it("evaluate resolves with an error message on 'times' when an invalid number is provided", () => {
    const command = new Command(
      undefined,
      ControlFlowCommandNames.times,
      'asdf',
      ''
    )
    const node = new CommandNode(command)
    node._evaluate().then(result => {
      expect(result.result).toEqual('Invalid number provided as a target.')
    })
  })
  it('timesVisited only incremenrts for control flow commands', () => {
    let command = new Command(undefined, ControlFlowCommandNames.times, '', '')
    let node = new CommandNode(command)
    expect(node.timesVisited).toBe(0)
    node._incrementTimesVisited()
    expect(node.timesVisited).toBe(1)
    command = new Command(undefined, 'command', '', '')
    node = new CommandNode(command)
    expect(node.timesVisited).toBe(0)
    node._incrementTimesVisited()
    expect(node.timesVisited).toBe(0)
  })
  it("evaluationResult returns the 'right' node on true", () => {
    const command = new Command(undefined, 'a', '', '')
    const node = new CommandNode(command)
    node.right = 'b'
    node.left = 'c'
    const result = node._evaluationResult({ result: 'success', value: true })
    expect(result.next).toEqual('b')
  })
  it("evaluationResult returns the 'left' node on false", () => {
    const command = new Command(undefined, 'a', '', '')
    const node = new CommandNode(command)
    node.right = 'b'
    node.left = 'c'
    const result = node._evaluationResult({ result: 'success', value: false })
    expect(result.next).toEqual('c')
  })
  it('evaluationResult returns a message when unsuccessful', () => {
    const command = new Command(undefined, 'a', '', '')
    const node = new CommandNode(command)
    node.right = 'b'
    node.left = 'c'
    const result = node._evaluationResult({ result: 'no dice' })
    expect(result.next).toBeUndefined()
    expect(result.result).toEqual('no dice')
  })
  it("executionResult returns the 'next' node on extCommand", () => {
    const command = new Command(undefined, 'open', '', '')
    let nodeA = new CommandNode(command)
    const nodeB = new CommandNode(command)
    nodeA.next = nodeB
    expect(nodeA._executionResult(commandExecutor(true, false)).next).toEqual(
      nodeB
    )
  })
  it("executionResult returns the 'next' node on Selenium command", () => {
    const command = new Command(undefined, 'click', '', '')
    let nodeA = new CommandNode(command)
    const nodeB = new CommandNode(command)
    nodeA.next = nodeB
    expect(
      nodeA._executionResult(commandExecutor(), { result: 'success' }).next
    ).toEqual(nodeB)
  })
  it("executionResult returns the 'next' node and result message on verify command", () => {
    const command = new Command(undefined, 'verify', '', '')
    let nodeA = new CommandNode(command)
    const nodeB = new CommandNode(command)
    nodeA.next = nodeB
    expect(
      nodeA._executionResult(commandExecutor(), { result: 'failed with error' })
        .next
    ).toEqual(nodeB)
  })
  it("executionResult returns a 'next' node on control flow", () => {
    const command = new Command(undefined, ControlFlowCommandNames.if, '', '')
    let nodeA = new CommandNode(command)
    nodeA.left = 'asdf'
    const nodeB = new CommandNode(command)
    expect(
      nodeA._executionResult(commandExecutor(), {
        result: 'success',
        next: nodeB,
      }).next
    ).toEqual(nodeB)
  })
  it('executionResult returns a message when unsuccessful', () => {
    const command = new Command(undefined, 'command', '', '')
    const node = new CommandNode(command)
    const result = node._executionResult(commandExecutor(), {
      result: 'no dice',
    })
    expect(result.next).toBeUndefined()
    expect(result.result).toEqual('no dice')
  })
})

function commandExecutor(extCommand = false, webDriverCommand = false) {
  return {
    isExtCommand: function() {
      return extCommand
    },
    isWebDriverCommand: function() {
      return webDriverCommand
    },
  }
}
