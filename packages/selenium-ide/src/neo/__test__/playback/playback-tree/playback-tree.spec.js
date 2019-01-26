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

import {
  createPlaybackTree,
  createCommandNodesFromCommandStack,
} from '../../../playback/playback-tree'
import Command, { ControlFlowCommandNames } from '../../../models/Command'

function createCommand(name) {
  return new Command(null, name, '', '')
}

describe('Control Flow', () => {
  describe('Process', () => {
    describe('Linked List Validation', () => {
      test('nodes contain command references and levels', () => {
        let input = [createCommand('command1'), createCommand('command2')]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].command).toEqual(input[0])
        expect(stack[0].level).toEqual(0)
        expect(stack[1].command).toEqual(input[1])
        expect(stack[1].level).toEqual(0)
      })
      test('command-command', () => {
        let input = [createCommand('command1'), createCommand('command2')]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toEqual(stack[1])
        expect(stack[0].left).toBeUndefined()
        expect(stack[0].right).toBeUndefined()
        expect(stack[1].next).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
        expect(stack[1].right).toBeUndefined()
      })
      test('if-command-elseIf-command-else-command-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.elseIf),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.else),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        // if
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[2])
        // command
        expect(stack[1].next).toEqual(stack[6])
        expect(stack[1].right).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
        // elseIf
        expect(stack[2].next).toBeUndefined()
        expect(stack[2].right).toEqual(stack[3])
        expect(stack[2].left).toEqual(stack[4])
        // command
        expect(stack[3].next).toEqual(stack[6])
        expect(stack[3].right).toBeUndefined()
        expect(stack[3].left).toBeUndefined()
        // else
        expect(stack[4].next).toEqual(stack[5])
        expect(stack[4].right).toBeUndefined()
        expect(stack[4].left).toBeUndefined()
        // command
        expect(stack[5].next).toEqual(stack[6])
        expect(stack[5].right).toBeUndefined()
        expect(stack[5].left).toBeUndefined()
        // end
        expect(stack[6].next).toBeUndefined()
        expect(stack[6].right).toBeUndefined()
        expect(stack[6].left).toBeUndefined()
      })
      test('while-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.end),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[1])
        expect(stack[1].next).toBeUndefined()
        expect(stack[1].right).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
      })
      test('while-command-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.while),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[2])
        expect(stack[1].next).toEqual(stack[0])
        expect(stack[1].right).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
        expect(stack[2].next).toBeUndefined()
        expect(stack[2].right).toBeUndefined()
        expect(stack[2].left).toBeUndefined()
      })
      test('while-command-command-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.while),
          createCommand('command'),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[3])
        expect(stack[1].next).toEqual(stack[2])
        expect(stack[1].right).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
        expect(stack[2].next).toEqual(stack[0])
        expect(stack[2].right).toBeUndefined()
        expect(stack[2].left).toBeUndefined()
        expect(stack[3].next).toBeUndefined()
        expect(stack[3].right).toBeUndefined()
        expect(stack[3].left).toBeUndefined()
      })
      test('while-if-end-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.while), // 0
          createCommand(ControlFlowCommandNames.if), // 1
          createCommand('command'), // 2
          createCommand(ControlFlowCommandNames.end), // 3
          createCommand(ControlFlowCommandNames.end), // 4
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[4])
        expect(stack[1].next).toBeUndefined()
        expect(stack[1].right).toEqual(stack[2])
        expect(stack[1].left).toEqual(stack[3])
        expect(stack[2].next).toEqual(stack[3])
        expect(stack[2].right).toBeUndefined()
        expect(stack[2].left).toBeUndefined()
        expect(stack[3].next).toEqual(stack[0])
        expect(stack[3].right).toBeUndefined()
        expect(stack[3].left).toBeUndefined()
        expect(stack[4].next).toBeUndefined()
        expect(stack[4].right).toBeUndefined()
        expect(stack[4].left).toBeUndefined()
      })
      test('while-if-end-command-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.while), // 0
          createCommand(ControlFlowCommandNames.if), // 1
          createCommand('command'), // 2
          createCommand(ControlFlowCommandNames.end), // 3
          createCommand('command'), // 4
          createCommand(ControlFlowCommandNames.end), // 5
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[5])
        expect(stack[1].next).toBeUndefined()
        expect(stack[1].right).toEqual(stack[2])
        expect(stack[1].left).toEqual(stack[3])
        expect(stack[2].next).toEqual(stack[3])
        expect(stack[2].right).toBeUndefined()
        expect(stack[2].left).toBeUndefined()
        expect(stack[3].next).toEqual(stack[4])
        expect(stack[3].right).toBeUndefined()
        expect(stack[3].left).toBeUndefined()
        expect(stack[4].next).toEqual(stack[0])
        expect(stack[4].right).toBeUndefined()
        expect(stack[4].left).toBeUndefined()
        expect(stack[5].next).toBeUndefined()
        expect(stack[5].right).toBeUndefined()
        expect(stack[5].left).toBeUndefined()
      })
      test('if-command-while-command-end-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.while),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.end),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        // if
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[5])
        // command
        expect(stack[1].next).toEqual(stack[2])
        expect(stack[1].right).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
        // while
        expect(stack[2].next).toBeUndefined()
        expect(stack[2].right).toEqual(stack[3])
        expect(stack[2].left).toEqual(stack[4])
        // command
        expect(stack[3].next).toEqual(stack[2])
        expect(stack[3].right).toBeUndefined()
        expect(stack[3].left).toBeUndefined()
        // end
        expect(stack[4].next).toEqual(stack[5])
        expect(stack[4].right).toBeUndefined()
        expect(stack[4].left).toBeUndefined()
        // end
        expect(stack[5].next).toBeUndefined()
        expect(stack[5].right).toBeUndefined()
        expect(stack[5].left).toBeUndefined()
      })
      test('if-while-command-end-command-else-command-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.while),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.else),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        // if
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[5])
        // while
        expect(stack[1].next).toBeUndefined()
        expect(stack[1].right).toEqual(stack[2])
        expect(stack[1].left).toEqual(stack[3])
        // command
        expect(stack[2].next).toEqual(stack[1])
        expect(stack[2].right).toBeUndefined()
        expect(stack[2].left).toBeUndefined()
        // end
        expect(stack[3].next).toEqual(stack[4])
        expect(stack[3].right).toBeUndefined()
        expect(stack[3].left).toBeUndefined()
        // command
        expect(stack[4].next).toEqual(stack[7])
        expect(stack[4].right).toBeUndefined()
        expect(stack[4].left).toBeUndefined()
        // else
        expect(stack[5].next).toEqual(stack[6])
        expect(stack[5].right).toBeUndefined()
        expect(stack[5].left).toBeUndefined()
        // command
        expect(stack[6].next).toEqual(stack[7])
        expect(stack[6].right).toBeUndefined()
        expect(stack[6].left).toBeUndefined()
        // end
        expect(stack[7].next).toBeUndefined()
        expect(stack[7].right).toBeUndefined()
        expect(stack[7].left).toBeUndefined()
      })
      test('do-command-repeatIf-command', () => {
        let input = [
          createCommand(ControlFlowCommandNames.do),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.repeatIf),
          createCommand('command'),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toEqual(stack[1])
        expect(stack[0].right).toBeUndefined()
        expect(stack[0].left).toBeUndefined()
        expect(stack[1].next).toEqual(stack[2])
        expect(stack[1].right).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
        expect(stack[2].next).toBeUndefined()
        expect(stack[2].right).toEqual(stack[0])
        expect(stack[2].left).toEqual(stack[3])
      })
      test('do-command-while-command-end-repeatIf', () => {
        let input = [
          createCommand(ControlFlowCommandNames.do),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.while),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.repeatIf),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toEqual(stack[1])
        expect(stack[0].right).toBeUndefined()
        expect(stack[0].left).toBeUndefined()
        expect(stack[1].next).toEqual(stack[2])
        expect(stack[1].right).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
        expect(stack[2].next).toBeUndefined()
        expect(stack[2].right).toEqual(stack[3])
        expect(stack[2].left).toEqual(stack[4])
        expect(stack[3].next).toEqual(stack[2])
        expect(stack[3].right).toBeUndefined()
        expect(stack[3].left).toBeUndefined()
        expect(stack[4].next).toEqual(stack[5])
        expect(stack[4].right).toBeUndefined()
        expect(stack[4].left).toBeUndefined()
        expect(stack[5].next).toBeUndefined()
        expect(stack[5].right).toEqual(stack[0])
        expect(stack[5].left).toBeUndefined()
      })
      test('times-command-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.times),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[2])
        expect(stack[1].next).toEqual(stack[0])
        expect(stack[1].right).toBeUndefined()
        expect(stack[1].left).toBeUndefined()
        expect(stack[2].next).toBeUndefined()
        expect(stack[2].right).toBeUndefined()
        expect(stack[2].left).toBeUndefined()
      })
      test('if-if-if-if-end-end-end-command-end', () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.end),
          createCommand('command'),
          createCommand(ControlFlowCommandNames.end),
        ]
        let stack = createCommandNodesFromCommandStack(input)
        expect(stack[0].next).toBeUndefined()
        expect(stack[0].right).toEqual(stack[1])
        expect(stack[0].left).toEqual(stack[8])
        expect(stack[1].next).toBeUndefined()
        expect(stack[1].right).toEqual(stack[2])
        expect(stack[1].left).toEqual(stack[6])
        expect(stack[2].next).toBeUndefined()
        expect(stack[2].right).toEqual(stack[3])
        expect(stack[2].left).toEqual(stack[5])
        expect(stack[3].next).toBeUndefined()
        expect(stack[3].right).toEqual(stack[4])
        expect(stack[3].left).toEqual(stack[4])
        expect(stack[4].next).toEqual(stack[5])
        expect(stack[4].right).toBeUndefined()
        expect(stack[4].left).toBeUndefined()
        expect(stack[5].next).toEqual(stack[6])
        expect(stack[5].right).toBeUndefined()
        expect(stack[5].left).toBeUndefined()
        expect(stack[6].next).toEqual(stack[7])
        expect(stack[6].right).toBeUndefined()
        expect(stack[6].left).toBeUndefined()
        expect(stack[7].next).toEqual(stack[8])
        expect(stack[7].right).toBeUndefined()
        expect(stack[7].left).toBeUndefined()
        expect(stack[8].next).toBeUndefined()
        expect(stack[8].right).toBeUndefined()
        expect(stack[8].left).toBeUndefined()
      })
      test('comment on empty command', () => {
        let emptyCommandWithComment = createCommand('')
        emptyCommandWithComment.setComment('blah')
        const input = [emptyCommandWithComment, createCommand('open')]
        const tree = createPlaybackTree(input)
        expect(tree.startingCommandNode.command).toEqual(input[0])
        expect(tree.startingCommandNode.next.command).toEqual(input[1])
      })
    })
  })
  describe('Processed', () => {
    it('knows if there are control flow commands within the command stack', () => {
      let input = [
        createCommand(ControlFlowCommandNames.do),
        createCommand('command'),
        createCommand(ControlFlowCommandNames.repeatIf),
      ]
      const tree = createPlaybackTree(input)
      expect(tree.containsControlFlow).toBeTruthy()
    })
    it('do-command-repeatIf-end skips do', () => {
      let input = [
        createCommand(ControlFlowCommandNames.do),
        createCommand('command'),
        createCommand(ControlFlowCommandNames.repeatIf),
      ]
      let tree = createPlaybackTree(input)
      expect(tree.startingCommandNode.command).toEqual(input[0])
      expect(tree.startingCommandNode.next.command).toEqual(input[1])
      expect(tree.startingCommandNode.next.next.command).toEqual(input[2])
      expect(tree.startingCommandNode.next.next.right.command).toEqual(input[0])
      expect(tree.startingCommandNode.next.next.left).toBeUndefined()
    })
    it('populated tree exists with correct values', () => {
      let input = [
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
      ]
      let tree = createPlaybackTree(input)
      expect(tree.startingCommandNode.command).toEqual(input[0]) //                                                  if
      expect(tree.startingCommandNode.right.command).toEqual(input[1]) //                                            if -> command
      expect(tree.startingCommandNode.right.next.command).toEqual(input[12]) //                                      if -> end
      expect(tree.startingCommandNode.left.command).toEqual(input[2]) //                                             if -> while -> else
      expect(tree.startingCommandNode.left.next.right.command).toEqual(input[4]) //                                  while -> command
      expect(tree.startingCommandNode.left.next.left.command).toEqual(input[5]) //                                   while -> end
      expect(tree.startingCommandNode.left.next.left.next.command).toEqual(
        input[6]
      ) //                              do
      expect(
        tree.startingCommandNode.left.next.left.next.next.next.right.command
      ).toEqual(input[9]) //              do -> while -> command
      expect(
        tree.startingCommandNode.left.next.left.next.next.next.left.command
      ).toEqual(input[10]) //              do -> while -> end
      expect(
        tree.startingCommandNode.left.next.left.next.next.next.left.next.right
          .command
      ).toEqual(input[6]) //    repeatIf -> do
      expect(
        tree.startingCommandNode.left.next.left.next.next.next.left.next.left
          .command
      ).toEqual(input[12]) //    repeatIf -> end
      expect(
        tree.startingCommandNode.left.next.left.next.next.next.left.next.left
          .next
      ).toBeUndefined() //          end
      expect(
        tree.startingCommandNode.left.next.left.next.next.next.left.next.left
          .right
      ).toBeUndefined() //         end
      expect(
        tree.startingCommandNode.left.next.left.next.next.next.left.next.left
          .left
      ).toBeUndefined() //          end
    })
  })
})
