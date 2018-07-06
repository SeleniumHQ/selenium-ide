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

import { PlaybackTree } from "../../IO/playback-tree";

describe("Control Flow", () => {
  describe("Preprocess", () => {
    describe("Leveling", () => {
      test("returns leveled command stack", () => {
        let playbackTree = new PlaybackTree([
          { name: "if" },
          { name: "command" },
          { name: "else" },
          { name: "while" },
          { name: "command" },
          { name: "end" },
          { name: "do" },
          { name: "command" },
          { name: "while" },
          { name: "end" },
          { name: "do" },
          { name: "command" },
          { name: "repeatIf" },
          { name: "end" },
          { name: "end" }
        ]);
        playbackTree._preprocessCommands();
        let stack = playbackTree._commandNodeStack;
        expect(stack[0].level).toEqual(0); //  if
        expect(stack[1].level).toEqual(1); //    command
        expect(stack[2].level).toEqual(0); //  else
        expect(stack[3].level).toEqual(1); //    while
        expect(stack[4].level).toEqual(2); //      command
        expect(stack[5].level).toEqual(1); //    end
        expect(stack[6].level).toEqual(1); //    do
        expect(stack[7].level).toEqual(2); //      command
        expect(stack[8].level).toEqual(2); //      while
        expect(stack[9].level).toEqual(1); //    end
        expect(stack[10].level).toEqual(1); //   do
        expect(stack[11].level).toEqual(2); //     command
        expect(stack[12].level).toEqual(2); //     repeatIf
        expect(stack[13].level).toEqual(1); //   end
        expect(stack[14].level).toEqual(0); // end
      });
    });
    describe("Syntax Validation", () => {
      test("if, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "end" }]);
        expect(playbackTree._preprocessCommands()).toBeTruthy();
      });
      test("if, else, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "end" }]);
        expect(playbackTree._preprocessCommands()).toBeTruthy();
      });
      test("if, elseIf, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "elseIf" }, { name: "end" }]);
        expect(playbackTree._preprocessCommands()).toBeTruthy();
      });
      test("if, elseIf, else, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "elseIf" }, { name: "else" }, { name: "end" }]);
        expect(playbackTree._preprocessCommands()).toBeTruthy();
      });
      test("while, end", () => {
        let playbackTree = new PlaybackTree([{ name: "while" }, { name: "end" }]);
        expect(playbackTree._preprocessCommands()).toBeTruthy();
      });
      test("times, end", () => {
        let playbackTree = new PlaybackTree([{ name: "times" }, { name: "end" }]);
        expect(playbackTree._preprocessCommands()).toBeTruthy();
      });
      test("do, repeatIf, end", () => {
        let playbackTree = new PlaybackTree([{ name: "do" }, { name: "repeatIf" }, { name: "end" }]);
        expect(playbackTree._preprocessCommands()).toBeTruthy();
      });
      test("do, while, end", () => {
        let playbackTree = new PlaybackTree([{ name: "do" }, { name: "while" }, { name: "end" }]);
        expect(playbackTree._preprocessCommands()).toBeTruthy();
      });
    });
    describe("Syntax Invalidation", () => {
      test("if", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Incomplete block at if");
      });
      test("if, if, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "if" }, { name: "end" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Incomplete block at if");
      });
      test("if, else, elseIf, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "end" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Incorrect command order of elseIf / else");
      });
      test("if, else, else, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "else" }, { name: "end" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Too many else commands used");
      });
      test("while", () => {
        let playbackTree = new PlaybackTree([{ name: "while" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Incomplete block at while");
      });
      test("if, while", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Incomplete block at while");
      });
      test("if, while, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }, { name: "end" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Incomplete block at if");
      });
      test("if, while, else, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }, { name: "else" }, { name: "end" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("An else / elseIf used outside of an if block");
      });
      test("times", () => {
        let playbackTree = new PlaybackTree([{ name: "times" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Incomplete block at times");
      });
      test("repeatIf", () => {
        let playbackTree = new PlaybackTree([{ name: "repeatIf" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("A repeatIf used without a do block");
      });
      test("do", () => {
        let playbackTree = new PlaybackTree([{ name: "do" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Incomplete block at do");
      });
      test("end", () => {
        let playbackTree = new PlaybackTree([{ name: "end" }]);
        expect(function() { playbackTree._preprocessCommands(); }).toThrow("Use of end without an opening keyword");
      });
    });
  });
  describe("Process", () => {
    describe("Linked List Validation", () => {
      test("nodes contain command references", () => {
        let input = [
          { name: "command1" },
          { name: "command2" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree._preprocessCommands();
        playbackTree._processCommandNodes();
        let stack = playbackTree._commandNodeStack;
        expect(stack[0].command).toEqual(input[0]);
        expect(stack[1].command).toEqual(input[1]);
      });
      test("command-command", () => {
        let input = [
          { name: "command1" },
          { name: "command2" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree._preprocessCommands();
        playbackTree._processCommandNodes();
        let stack = playbackTree._commandNodeStack;
        expect(stack[0].next).toEqual(stack[1]);
        expect(stack[0].left).toBeUndefined();
        expect(stack[0].right).toBeUndefined();
        expect(stack[1].next).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[1].right).toBeUndefined();
      });
      test("if-command-elseIf-command-else-command-end", () => {
        let input = [
          { name: "if" },
          { name: "command" },
          { name: "elseIf" },
          { name: "command" },
          { name: "else" },
          { name: "command" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree._preprocessCommands();
        playbackTree._processCommandNodes();
        let stack = playbackTree._commandNodeStack;
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
          { name: "while" },
          { name: "command" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree._preprocessCommands();
        playbackTree._processCommandNodes();
        let stack = playbackTree._commandNodeStack;
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
      test("if-command-while-command-end-end", () => {
        let input = [
          { name: "if" },
          { name: "command" },
          { name: "while" },
          { name: "command" },
          { name: "end" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree._preprocessCommands();
        playbackTree._processCommandNodes();
        let stack = playbackTree._commandNodeStack;
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
          { name: "if" },
          { name: "while" },
          { name: "command" },
          { name: "end" },
          { name: "command" },
          { name: "else" },
          { name: "command" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree._preprocessCommands();
        playbackTree._processCommandNodes();
        let stack = playbackTree._commandNodeStack;
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
      test("do-command-while-end", () => {
        let input = [
          { name: "do" },
          { name: "command" },
          { name: "while" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree._preprocessCommands();
        playbackTree._processCommandNodes();
        let stack = playbackTree._commandNodeStack;
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
      test.skip("do-command-repeatIf-end", () => {
        let input = [
          { name: "do" },
          { name: "command" },
          { name: "repeatIf" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree._preprocessCommands();
        playbackTree._processCommandNodes();
        let stack = playbackTree._commandNodeStack;
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
    });
  });
});
