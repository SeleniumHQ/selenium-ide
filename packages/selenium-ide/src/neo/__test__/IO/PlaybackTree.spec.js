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

class CommandStackHandler {
  constructor(stack) {
    this._inputStack = stack;
    this._state = [];
    this._level = 0;
    this._currentCommand;
    this._currentCommandIndex;
    this.stack = [];
  }

  preprocessCommand(command, index) {
    this._currentCommand = command;
    this._currentCommandIndex = index;
    switch (command.name) {
      case "if":
      case "do":
      case "times":
        this._mutation1();
        break;
      case "while":
        if (this._topOfState().name === "do") {
          this._mutation3();
        } else {
          this._mutation1();
        }
        break;
      case "repeatIf":
        if (this._topOfState().name !== "do") {
          throw "A repeatIf used without a do block";
        }
        this._mutation3();
        break;
      case "else":
        if (this._topOfState().name !== "if") {
          throw "An else / elseIf used outside of an if block";
        }
        this._mutation2();
        break;
      case "end":
        if (this._terminatesLoop()) {
          this._mutation4();
        } else if (this._terminatesIf()) {
          const elseCount = this._currentSegment().filter(command => command.name === "else").length;
          const elseSegment = this._currentSegment().filter(command => command.name.match(/else/));
          if (elseCount > 1) {
            throw "Too many else commands used";
          } else if (elseCount === 1 && this._topOf(elseSegment).name !== "else") {
            throw "Incorrect command order of elseIf / else";
          } else if (elseCount === 0 || this._topOf(elseSegment).name === "else") {
            this._mutation4();
          }
        } else {
          throw "Use of end without an opening keyword";
        }
        break;
      default:
        this._mutation3();
        break;
    }
  }

  confirmControlFlowSyntax() {
    if (this._state.length > 0) {
      throw "Incomplete block at " + this._topOfState().name;
    }
  }

  _createAndStoreCommandNode() {
    let node = new CommandNode;
    node.command = this._currentCommand;
    node.level = this._level;
    this.stack.push(node);
  }

  _topOf(segment) {
    return segment[segment.length - 1];
  }

  _topOfState() {
    let command = this._state[this._state.length - 1];
    if (command) {
      return this._topOf(this._state);
    } else {
      return { name: "" };
    }
  }

  _currentSegment() {
    return this._inputStack.slice(this._topOfState().index, this._currentCommandIndex);
  }

  _terminatesIf() {
    return (this._topOfState().name === "if");
  }

  _terminatesLoop() {
    return (this._topOfState().name === "while" ||
            this._topOfState().name === "times" ||
            this._topOfState().name === "do");
  }

  _mutation1() {
    this._createAndStoreCommandNode();
    this._state.push({ name: this._currentCommand.name, index: this._currentCommandIndex });
    this._level++;
  }

  _mutation2() {
    this._level--;
    this._createAndStoreCommandNode();
    this._level++;
  }

  _mutation3() {
    this._createAndStoreCommandNode();
  }

  _mutation4() {
    this._level--;
    this._createAndStoreCommandNode();
    this._state.pop();
  }

}

class CommandNode {
  constructor() {
    this.command;
    this.next = undefined;
    this.left = undefined;
    this.right = undefined;
    this.level;
    this.timesVisited;
  }
}

class PlaybackTree {
  constructor(stack) {
    this.inputStack = stack;
    this._preprocessStack = [];
    this.stack = [];
  }

  preprocess() {
    let commandStackHandler = new CommandStackHandler(this.inputStack);
    this.inputStack.forEach(function(currentCommand, currentCommandIndex) {
      commandStackHandler.preprocessCommand(currentCommand, currentCommandIndex);
    });
    commandStackHandler.confirmControlFlowSyntax();
    this._preprocessStack = [...commandStackHandler.stack];
    return this._preprocessStack;
  }

  nextNodeAtSameLevel(stack, index, level) {
    for(let i = index + 1; i !== stack.length; i++) {
      if (stack[i].level === level) {
        return stack[i];
      }
    }
  }

  nextEndNode(stack, index, level) {
    for(let i = index + 1; i !== stack.length; i++) {
      if (stack[i].command.name === "end" && stack[i].level === level) {
        return stack[i];
      }
    }
  }

  previousOpeningNode(stack, index, level) {
    for(let i = index; i > -1; i--) {
      if (stack[i].level === level - 1) {
        return stack[i];
      }
    }
  }

  process() {
    this.stack = [...this._preprocessStack];
    let stack = this.stack;
    let nextNodeAtSameLevel = this.nextNodeAtSameLevel;
    let nextEndNode = this.nextEndNode;
    let previousOpeningNode = this.previousOpeningNode;
    stack.forEach(function(currentCommandNode, currentCommandIndex) {
      let nextCommandNode = stack[currentCommandIndex + 1];
      if (nextCommandNode) {
        if (currentCommandNode.command.isControlFlowCommand() &&
            !currentCommandNode.command.isEnd() &&
            !currentCommandNode.command.isDo()) {
          currentCommandNode.right = nextCommandNode;
          currentCommandNode.left = nextNodeAtSameLevel(stack, currentCommandIndex, currentCommandNode.level);
        } else if (nextCommandNode.command.isControlFlowCommand()) {
          let openingNode = previousOpeningNode(stack, currentCommandIndex, currentCommandNode.level);
          if (openingNode) {
            if (openingNode.command.isLoop()) {
              currentCommandNode.next = openingNode;
            } else if (openingNode.command.isDo() && currentCommandNode.command.isWhile()) {
              currentCommandNode.next = openingNode;
            } else if (!openingNode.command.isLoop() && !openingNode.command.isDo()) {
              currentCommandNode.next = nextEndNode(stack, currentCommandIndex, openingNode.level);
            } else {
              currentCommandNode.next = nextCommandNode;
            }
          }
        } else {
          currentCommandNode.next = nextCommandNode;
        }
      }
    });
    return this.stack;
  }

}

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
        let stack = playbackTree.preprocess();
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
        expect(playbackTree.preprocess()).toBeTruthy();
      });
      test("if, else, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
      test("if, elseIf, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "elseIf" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
      test("if, elseIf, else, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "elseIf" }, { name: "else" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
      test("while, end", () => {
        let playbackTree = new PlaybackTree([{ name: "while" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
      test("times, end", () => {
        let playbackTree = new PlaybackTree([{ name: "times" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
      test("do, repeatIf, end", () => {
        let playbackTree = new PlaybackTree([{ name: "do" }, { name: "repeatIf" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
      test("do, while, end", () => {
        let playbackTree = new PlaybackTree([{ name: "do" }, { name: "while" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
    });
    describe("Syntax Invalidation", () => {
      test("if", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at if");
      });
      test("if, if, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "if" }, { name: "end" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at if");
      });
      test("if, else, elseIf, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "end" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incorrect command order of elseIf / else");
      });
      test("if, else, else, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "else" }, { name: "end" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Too many else commands used");
      });
      test("while", () => {
        let playbackTree = new PlaybackTree([{ name: "while" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at while");
      });
      test("if, while", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at while");
      });
      test("if, while, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }, { name: "end" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at if");
      });
      test("if, while, else, end", () => {
        let playbackTree = new PlaybackTree([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }, { name: "else" }, { name: "end" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("An else / elseIf used outside of an if block");
      });
      test("times", () => {
        let playbackTree = new PlaybackTree([{ name: "times" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at times");
      });
      test("repeatIf", () => {
        let playbackTree = new PlaybackTree([{ name: "repeatIf" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("A repeatIf used without a do block");
      });
      test("do", () => {
        let playbackTree = new PlaybackTree([{ name: "do" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at do");
      });
      test("end", () => {
        let playbackTree = new PlaybackTree([{ name: "end" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Use of end without an opening keyword");
      });
    });
  });
  describe("Process", () => {
    describe.skip("Linked List Validation", () => {
      test("command-command", () => {
        let input = [
          { name: "command1" },
          { name: "command2" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree.preprocess();
        let stack = playbackTree.process();
        expect(stack[0].command).toEqual(input[0]);
        expect(stack[1].command).toEqual(input[1]);
        expect(stack[0].next).toEqual(stack[1]);
        expect(stack[0].left).toBeUndefined();
        expect(stack[0].right).toBeUndefined();
        expect(stack[1].next).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[1].right).toBeUndefined();
      });
      test("if-command-else-command-end", () => {
        let input = [
          { name: "if" },
          { name: "command" },
          { name: "else" },
          { name: "command" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree.preprocess();
        let stack = playbackTree.process();
        expect(stack[0].command).toEqual(input[0]);
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[2]);
        expect(stack[1].command).toEqual(input[1]);
        expect(stack[1].next).toEqual(stack[4]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[2].command).toEqual(input[2]);
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toEqual(stack[3]);
        expect(stack[2].left).toEqual(stack[4]);
        expect(stack[3].command).toEqual(input[3]);
        expect(stack[3].next).toEqual(stack[4]);
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
        expect(stack[4].command).toEqual(input[4]);
        expect(stack[4].next).toBeUndefined();
        expect(stack[4].right).toBeUndefined();
        expect(stack[4].left).toBeUndefined();
      });
      test("while-command-end", () => {
        let input = [
          { name: "while" },
          { name: "command" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree.preprocess();
        let stack = playbackTree.process();
        expect(stack[0].command).toEqual(input[0]);
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[2]);
        expect(stack[1].command).toEqual(input[1]);
        expect(stack[1].next).toEqual(stack[0]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[2].command).toEqual(input[2]);
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toBeUndefined();
        expect(stack[2].left).toBeUndefined();
      });
      test("if-while-command-end-else-command-end", () => {
        let input = [
          { name: "if" },
          { name: "while" },
          { name: "command" },
          { name: "end" },
          { name: "else" },
          { name: "command" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree.preprocess();
        let stack = playbackTree.process();
        // if
        expect(stack[0].command).toEqual(input[0]);
        expect(stack[0].next).toBeUndefined();
        expect(stack[0].right).toEqual(stack[1]);
        expect(stack[0].left).toEqual(stack[4]);
        // while
        expect(stack[1].command).toEqual(input[1]);
        expect(stack[1].next).toBeUndefined();
        expect(stack[1].right).toEqual(stack[2]);
        expect(stack[1].left).toEqual(stack[3]);
        // command
        expect(stack[2].command).toEqual(input[2]);
        expect(stack[2].next).toEqual(stack[1]);
        expect(stack[2].right).toBeUndefined();
        expect(stack[2].left).toBeUndefined();
        // end
        expect(stack[3].command).toEqual(input[3]);
        expect(stack[3].next).toEqual(stack[6]);
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
        // else
        expect(stack[4].command).toEqual(input[4]);
        expect(stack[4].next).toBeUndefined();
        expect(stack[4].right).toEqual(stack[5]);
        expect(stack[4].left).toEqual(stack[6]);
        // command
        expect(stack[5].command).toEqual(input[5]);
        expect(stack[5].next).toEqual(stack[6]);
        expect(stack[5].right).toBeUndefined();
        expect(stack[5].left).toBeUndefined();
        // end
        expect(stack[6].command).toEqual(input[6]);
        expect(stack[6].next).toBeUndefined();
        expect(stack[6].right).toBeUndefined();
        expect(stack[6].left).toBeUndefined();
      });
      test.skip("do-command-while-end", () => {
        let input = [
          { name: "do" },
          { name: "command" },
          { name: "while" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree.preprocess();
        let stack = playbackTree.process();
        expect(stack[0].command).toEqual(input[0]);
        expect(stack[0].next).toEqual(stack[1]);
        expect(stack[0].right).toBeUndefined();
        expect(stack[0].left).toBeUndefined();
        expect(stack[1].command).toEqual(input[1]);
        expect(stack[1].next).toEqual(stack[2]);
        expect(stack[1].right).toBeUndefined();
        expect(stack[1].left).toBeUndefined();
        expect(stack[2].command).toEqual(input[2]);
        expect(stack[2].next).toBeUndefined();
        expect(stack[2].right).toEqual(stack[0]);
        expect(stack[2].left).toEqual(stack[3]);
        expect(stack[3].command).toEqual(input[3]);
        expect(stack[3].next).toBeUndefined();
        expect(stack[3].right).toBeUndefined();
        expect(stack[3].left).toBeUndefined();
      });
    });
  });
});
