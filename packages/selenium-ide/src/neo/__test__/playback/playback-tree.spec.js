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

import { createPlaybackTree, deriveCommandLevels, verifyControlFlowSyntax, createCommandNodesFromCommandStack } from "../../playback/playback-tree";
import Command, { ControlFlowCommandNames } from "../../models/Command";

function createCommand(name) {
  return new Command(null, name, "", "");
}

describe("Control Flow", () => {
  describe("Preprocess", () => {
    describe("Leveling", () => {
      test("returns leveled command stack", () => {
        let stack = deriveCommandLevels([
          createCommand(ControlFlowCommandNames.if),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.while),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.do),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.while),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.repeatIf),
          createCommand(ControlFlowCommandNames.end)
        ]);
        expect(stack[0]).toEqual(0); //  if
        expect(stack[1]).toEqual(1); //    command
        expect(stack[2]).toEqual(0); //  else
        expect(stack[3]).toEqual(1); //    while
        expect(stack[4]).toEqual(2); //      command
        expect(stack[5]).toEqual(1); //    end
        expect(stack[6]).toEqual(1); //    do
        expect(stack[7]).toEqual(2); //      command
        expect(stack[8]).toEqual(2); //      while
        expect(stack[9]).toEqual(3); //        command
        expect(stack[10]).toEqual(2); //     end
        expect(stack[11]).toEqual(1); //   repeatIf
        expect(stack[12]).toEqual(0); //  end
      });
    });
    describe("Syntax Validation", () => {
      test("if, end", () => {
        let result = verifyControlFlowSyntax([
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.end)
        ]);
        expect(result).toBeTruthy();
      });
      test("if, else, end", () => {
        let result = verifyControlFlowSyntax([
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.end)
        ]);
        expect(result).toBeTruthy();
      });
      test("if, elseIf, end", () => {
        let result = verifyControlFlowSyntax([
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.elseIf),
          createCommand(ControlFlowCommandNames.end)
        ]);
        expect(result).toBeTruthy();
      });
      test("if, elseIf, else, end", () => {
        let result = verifyControlFlowSyntax([
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.elseIf),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.end)
        ]);
        expect(result).toBeTruthy();
      });
      test("while, end", () => {
        let result = new verifyControlFlowSyntax([
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.end)
        ]);
        expect(result).toBeTruthy();
      });
      test("times, end", () => {
        let result = verifyControlFlowSyntax([
          createCommand("times"),
          createCommand(ControlFlowCommandNames.end)
        ]);
        expect(result).toBeTruthy();
      });
      test("do, repeatIf", () => {
        let result = verifyControlFlowSyntax([
          createCommand(ControlFlowCommandNames.do),
          createCommand(ControlFlowCommandNames.repeatIf)
        ]);
        expect(result).toBeTruthy();
      });
      test("do, while, end, repeatIf", () => {
        let result = verifyControlFlowSyntax([
          createCommand(ControlFlowCommandNames.do),
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.repeatIf)
        ]);
        expect(result).toBeTruthy();
      });
    });
    describe("Syntax Invalidation", () => {
      test("if", () => {
        let input = [createCommand(ControlFlowCommandNames.if)];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Incomplete block at if");
      });
      test("if, if, end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.end)
        ];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Incomplete block at if");
      });
      test("if, else, elseIf, end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.elseIf),
          createCommand(ControlFlowCommandNames.end)
        ];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Incorrect command order of else if / else");
      });
      test("if, else, else, end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.end)
        ];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Too many else commands used");
      });
      test("else", () => {
        let input = [ createCommand(ControlFlowCommandNames.else) ];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("An else used outside of an if block");
      });
      test("elseIf", () => {
        let input = [ createCommand(ControlFlowCommandNames.elseIf) ];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("An else if used outside of an if block");
      });
      test("while", () => {
        let input = [createCommand(ControlFlowCommandNames.while)];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Incomplete block at while");
      });
      test("if, while", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.while)
        ];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Incomplete block at while");
      });
      test("if, while, end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.end)
        ];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Incomplete block at if");
      });
      test("if, while, else, end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.while),
          createCommand(ControlFlowCommandNames.else),
          createCommand(ControlFlowCommandNames.end)
        ];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("An else used outside of an if block");
      });
      test("times", () => {
        let input = [createCommand("times")];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Incomplete block at times");
      });
      test("repeatIf", () => {
        let input = [createCommand(ControlFlowCommandNames.repeatIf)];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("A repeat if used without a do block");
      });
      test("do", () => {
        let input = [createCommand(ControlFlowCommandNames.do)];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Incomplete block at do");
      });
      test("end", () => {
        let input = [createCommand(ControlFlowCommandNames.end)];
        expect(function() { verifyControlFlowSyntax(input); }).toThrow("Use of end without an opening keyword");
      });
    });
  });
  describe("Process", () => {
    describe("Linked List Validation", () => {
      test("nodes contain command references and levels", () => {
        let input = [ createCommand("command1"), createCommand("command2") ];
        let stack = createCommandNodesFromCommandStack(input);
        expect(stack[0].command).toEqual(input[0]);
        expect(stack[0].level).toEqual(0);
        expect(stack[1].command).toEqual(input[1]);
        expect(stack[1].level).toEqual(0);
      });
      test("command-command", () => {
        let input = [
          createCommand("command1"),
          createCommand("command2")
        ];
        let stack = createCommandNodesFromCommandStack(input);
        expect(stack[0].next).toEqual(stack[1]);
        expect(stack[0].left).toBeUndefined();
        expect(stack[0].right).toBeUndefined();
        expect(stack[1].next).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[1].right).toBeUndefined();
      });
      test("if-command-elseIf-command-else-command-end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.elseIf),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.else),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end)
        ];
        let stack = createCommandNodesFromCommandStack(input);
        // if
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[2]);
        // command
        expect(stack[1].next).toEqual(stack[6]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        // elseIf
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toEqual(stack[3]);
        expect(stack[2].left).toEqual(stack[4]);
        // command
        expect(stack[3].next).toEqual(stack[6]);
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
        // else
        expect(stack[4].next).toEqual(stack[5]);
        expect(stack[4].right).toBeUndefined();
        expect(stack[4].left).toBeUndefined();
        // command
        expect(stack[5].next).toEqual(stack[6]);
        expect(stack[5].right).toBeUndefined();
        expect(stack[5].left).toBeUndefined();
        // end
        expect(stack[6].next).toBeUndefined();
        expect(stack[6].right).toBeUndefined();
        expect(stack[6].left).toBeUndefined();
      });
      test("while-command-end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.while),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end)
        ];
        let stack = createCommandNodesFromCommandStack(input);
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[2]);
        expect(stack[1].next).toEqual(stack[0]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toBeUndefined();
        expect(stack[2].left).toBeUndefined();
      });
      test("while-command-command-end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.while),
          createCommand("command"),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end)
        ];
        let stack = createCommandNodesFromCommandStack(input);
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[3]);
        expect(stack[1].next).toEqual(stack[2]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[2].next).toEqual(stack[0]);
        expect(stack[2].right).toBeUndefined();
        expect(stack[2].left).toBeUndefined();
        expect(stack[3].next).toBeUndefined();
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
      });
      test("if-command-while-command-end-end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.while),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.end)
        ];
        let stack = createCommandNodesFromCommandStack(input);
        // if
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[5]);
        // command
        expect(stack[1].next).toEqual(stack[2]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        // while
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toEqual(stack[3]);
        expect(stack[2].left).toEqual(stack[4]);
        // command
        expect(stack[3].next).toEqual(stack[2]);
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
        // end
        expect(stack[4].next).toEqual(stack[5]);
        expect(stack[4].right).toBeUndefined();
        expect(stack[4].left).toBeUndefined();
        // end
        expect(stack[5].next).toBeUndefined();
        expect(stack[5].right).toBeUndefined();
        expect(stack[5].left).toBeUndefined();
      });
      test("if-while-command-end-command-else-command-end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.if),
          createCommand(ControlFlowCommandNames.while),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.else),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end)
        ];
        let stack = createCommandNodesFromCommandStack(input);
        // if
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[5]);
        // while
        expect(stack[1].next).toBeUndefined();
        expect(stack[1].right).toEqual(stack[2]);
        expect(stack[1].left).toEqual(stack[3]);
        // command
        expect(stack[2].next).toEqual(stack[1]);
        expect(stack[2].right).toBeUndefined();
        expect(stack[2].left).toBeUndefined();
        // end
        expect(stack[3].next).toEqual(stack[4]);
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
        // command
        expect(stack[4].next).toEqual(stack[7]);
        expect(stack[4].right).toBeUndefined();
        expect(stack[4].left).toBeUndefined();
        // else
        expect(stack[5].next).toEqual(stack[6]);
        expect(stack[5].right).toBeUndefined();
        expect(stack[5].left).toBeUndefined();
        // command
        expect(stack[6].next).toEqual(stack[7]);
        expect(stack[6].right).toBeUndefined();
        expect(stack[6].left).toBeUndefined();
        // end
        expect(stack[7].next).toBeUndefined();
        expect(stack[7].right).toBeUndefined();
        expect(stack[7].left).toBeUndefined();
      });
      test("do-command-repeatIf-end", () => {
        let input = [
          createCommand(ControlFlowCommandNames.do),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.repeatIf),
          createCommand("command")
        ];
        let stack = createCommandNodesFromCommandStack(input);
        expect(stack[0].next).toEqual(stack[1]);
        expect(stack[0].right).toBeUndefined();
        expect(stack[0].left).toBeUndefined();
        expect(stack[1].next).toEqual(stack[2]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toEqual(stack[0]);
        expect(stack[2].left).toEqual(stack[3]);
        expect(stack[3].next).toBeUndefined();
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
      });
      test("do-command-while-end-repeatIf", () => {
        let input = [
          createCommand(ControlFlowCommandNames.do),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.while),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end),
          createCommand(ControlFlowCommandNames.repeatIf)
        ];
        let stack = createCommandNodesFromCommandStack(input);
        expect(stack[0].next).toEqual(stack[1]);
        expect(stack[0].right).toBeUndefined();
        expect(stack[0].left).toBeUndefined();
        expect(stack[1].next).toEqual(stack[2]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toEqual(stack[3]);
        expect(stack[2].left).toEqual(stack[4]);
        expect(stack[3].next).toEqual(stack[2]);
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
        expect(stack[4].next).toEqual(stack[5]);
        expect(stack[4].right).toBeUndefined();
        expect(stack[4].left).toBeUndefined();
        expect(stack[5].next).toBeUndefined();
        expect(stack[5].right).toBeUndefined();
        expect(stack[5].left).toBeUndefined();
      });
      test("times-command-end", () => {
        let input = [
          createCommand("times"),
          createCommand("command"),
          createCommand(ControlFlowCommandNames.end)
        ];
        let stack = createCommandNodesFromCommandStack(input);
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[2]);
        expect(stack[1].next).toEqual(stack[0]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toBeUndefined();
        expect(stack[2].left).toBeUndefined();
      });
    });
  });
  describe("Processed", () => {
    it("populated tree exists with correct values", () => {
      let input = [
        createCommand(ControlFlowCommandNames.if),
        createCommand("command"),
        createCommand(ControlFlowCommandNames.else),
        createCommand(ControlFlowCommandNames.while),
        createCommand("command"),
        createCommand(ControlFlowCommandNames.end),
        createCommand(ControlFlowCommandNames.do),
        createCommand("command"),
        createCommand(ControlFlowCommandNames.while),
        createCommand("command"),
        createCommand(ControlFlowCommandNames.end),
        createCommand(ControlFlowCommandNames.repeatIf),
        createCommand(ControlFlowCommandNames.end)
      ];
      let tree = createPlaybackTree(input);
      expect(tree.currentCommandNode.command).toEqual(input[0]); //                                                 if
      expect(tree.currentCommandNode.right.command).toEqual(input[1]); //                                           if -> command
      expect(tree.currentCommandNode.right.next.command).toEqual(input[12]); //                                     if command -> end
      expect(tree.currentCommandNode.left.command).toEqual(input[2]); //                                            if -> else
      expect(tree.currentCommandNode.left.next.right.command).toEqual(input[4]); //                                 while -> command
      expect(tree.currentCommandNode.left.next.left.command).toEqual(input[5]); //                                  while -> end
      expect(tree.currentCommandNode.left.next.left.next.next.command).toEqual(input[7]); //                        do -> command
      expect(tree.currentCommandNode.left.next.left.next.next.next.right.command).toEqual(input[9]); //             while -> command
      expect(tree.currentCommandNode.left.next.left.next.next.next.left.command).toEqual(input[10]); //             while -> end
      expect(tree.currentCommandNode.left.next.left.next.next.next.left.next.right.command).toEqual(input[6]); //   repeatIf -> do
      expect(tree.currentCommandNode.left.next.left.next.next.next.left.next.left.command).toEqual(input[12]); //   repeatIf -> end
    });
  });
});
