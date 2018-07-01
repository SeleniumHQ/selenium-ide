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

class CommandNode {
  constructor() {
    this.next = undefined;
    this.left = undefined;
    this.right = undefined;
  }
}

class Command {
  constructor(command, commandStackHandler) {
    switch(command.name) {
      case "if":
        return new If(command, commandStackHandler);
      case "else":
      case "elseIf":
        return new Else(command, commandStackHandler);
      case "while":
      case "times":
      case "repeatIf":
        return new Loop(command, commandStackHandler);
      case "end":
        return new End(command, commandStackHandler);
      default:
        return new Default(command, commandStackHandler);
    }
  }
}

class If {
  constructor(command, commandStackHandler) {
    this.command = command;
    this.commandStackHandler = commandStackHandler;
  }

  preprocess() {
    this.commandStackHandler.store();
    this.commandStackHandler.setState();
    this.commandStackHandler.increaseLevel();
  }
}

class Else {
  constructor(command, commandStackHandler) {
    this.command = command;
    this.commandStackHandler = commandStackHandler;
  }

  preprocess() {
    if (this.commandStackHandler.top().name !== "if") {
      throw "An else / elseIf used outside of an if block";
    }
    this.commandStackHandler.decreaseLevel();
    this.commandStackHandler.store();
    this.commandStackHandler.increaseLevel();
  }
}

class Loop {
  constructor(command, commandStackHandler) {
    this.command = command;
    this.commandStackHandler = commandStackHandler;
  }

  preprocess() {
    this.commandStackHandler.store();
    this.commandStackHandler.setState();
    this.commandStackHandler.increaseLevel();
  }

}

class End {
  constructor(command, commandStackHandler) {
    this.command = command;
    this.commandStackHandler = commandStackHandler;
  }

  preprocess() {
    if (this.terminatesLoop()) {
      this.commandStackHandler.decreaseLevel();
      this.commandStackHandler.store();
      this.commandStackHandler.popState();
    } else if (this.terminatesIf()) {
      const segment = this.commandStackHandler.segment(
        this.commandStackHandler.top().index,
        this.commandStackHandler.currentCommandIndex
      );
      const elseCount = segment.filter(command => command.name === "else").length;
      const elseSegment = segment.filter(command => command.name.match(/else/));
      if (elseCount > 1) {
        throw "Too many else commands used";
      } else if (elseCount === 1 && this.commandStackHandler.topOf(elseSegment).name !== "else") {
        throw "Incorrect command order of elseIf / else";
      } else if (elseCount === 0 || this.commandStackHandler.topOf(elseSegment).name === "else") {
        this.commandStackHandler.decreaseLevel();
        this.commandStackHandler.store();
        this.commandStackHandler.popState();
      }
    }
  }

  terminatesIf() {
    return (this.commandStackHandler.top().name === "if");
  }

  terminatesLoop() {
    return (this.commandStackHandler.top().name === "while" ||
            this.commandStackHandler.top().name === "times" ||
            this.commandStackHandler.top().name === "repeatIf");
  }

}

class Default {
  constructor(command, commandStackHandler) {
    this.command = command;
    this.commandStackHandler = commandStackHandler;
  }

  preprocess() {
    this.commandStackHandler.store();
  }
}

class CommandStackHandler {
  constructor(stack) {
    this.stack = [];
    Object.assign(this.stack, stack);
    this.state = [];
    this.level = 0;
    this.currentCommand;
    this.currentCommandIndex;
  }

  increaseLevel() {
    this.level++;
  }

  decreaseLevel() {
    this.level--;
  }

  store() {
    Object.assign(this.stack[this.currentCommandIndex], { level: this.level });
  }

  setState() {
    this.state.push({ name: this.currentCommand.name, index: this.currentCommandIndex });
  }

  popState() {
    this.state.pop();
  }

  top() {
    return this.state[this.state.length - 1];
  }

  topOf(segment) {
    return segment[segment.length - 1];
  }

  segment(startIndex, endIndex) {
    return this.stack.slice(startIndex, endIndex);
  }

  setCurrentCommand(command, index) {
    this.currentCommand = command;
    this.currentCommandIndex = index;
  }

  confirmation() {
    if (this.state.length > 0) {
      throw "Incomplete block at " + this.top().name;
    }
  }
}

class PlaybackTree {
  constructor(stack) {
    this.inputStack = stack;
    this.preprocessStack = [];
    this.stack = [];
  }

  preprocess() {
    let commandStackHandler = new CommandStackHandler(this.inputStack);
    this.inputStack.forEach(function(currentCommand, currentCommandIndex) {
      commandStackHandler.setCurrentCommand(currentCommand, currentCommandIndex);
      let command = new Command(currentCommand, commandStackHandler);
      command.preprocess();
    });
    commandStackHandler.confirmation();
    this.preprocessStack = commandStackHandler.stack;
    return this.preprocessStack;
  }

  process() {
    let _stack = this.preprocessStack;
    let stack = this.stack;
    this.preprocessStack.forEach(function(command, index) {
      if (_stack[index + 1] && (command.level === _stack[index + 1].level)) {
        let node = new CommandNode;
        node.next = _stack[index + 1];
        stack.push(node);
      } else {
        let node = new CommandNode;
        node.right = _stack[index + 1];
        let segment = _stack.slice(index + 1, _stack.length + 1);
        let leftTarget = segment.findIndex(kommand => kommand.level === command.level);
        for(let i = index; i < _stack.length + 1; i++) {
          if (_stack[i + 1] && (_stack[i].level === _stack[i + 1].level)) {
            node.left = _stack[i + 1];
            break;
          }
        }
        stack.push(node);
      }
    });
  }

  topOf(stack) {
    return stack[stack.length - 1];
  }

}

describe("Control Flow", () => {
  describe("Preprocess", () => {
    test("marked with correct levels", () => {
      let _playbackTree = new PlaybackTree([
        { name: "if" },
        { name: "command" },
        { name: "else" },
        { name: "while" },
        { name: "command" },
        { name: "end" },
        { name: "end" }
      ]);
      let playbackTree = _playbackTree.preprocess();
      expect(playbackTree[0].level).toEqual(0); // if
      expect(playbackTree[1].level).toEqual(1); //   command
      expect(playbackTree[2].level).toEqual(0); // else
      expect(playbackTree[3].level).toEqual(1); //   while
      expect(playbackTree[4].level).toEqual(2); //     command
      expect(playbackTree[5].level).toEqual(1); //   end
      expect(playbackTree[6].level).toEqual(0); // end
    });
    describe("Validation", () => {
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
      test("repeatIf, end", () => {
        let playbackTree = new PlaybackTree([{ name: "repeatIf" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
      test("repeatIf, if, end, end", () => {
        let playbackTree = new PlaybackTree([{ name: "repeatIf" }, { name: "if" }, { name: "end" }, { name: "end" }]);
        expect(playbackTree.preprocess()).toBeTruthy();
      });
    });
    describe("Invalidation", () => {
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
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at repeatIf");
      });
      test("repeatIf, if", () => {
        let playbackTree = new PlaybackTree([{ name: "repeatIf" }, { name: "if" }]);
        expect(function() { playbackTree.preprocess(); }).toThrow("Incomplete block at if");
      });
    });
  });

  describe.skip("Process", () => {
    describe("Generate Linked List", () => {
      test("has next for command-command", () => {
        let input = [
          { name: "command1" },
          { name: "command2" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree.preprocess();
        playbackTree.process();
        expect(playbackTree.stack[0].next).toEqual(input[1]);
      });

      test("has next and left, right for if-command-end", () => {
        let input = [
          { name: "if" },
          { name: "command" },
          { name: "end" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree.preprocess();
        playbackTree.process();
        expect(playbackTree.stack[0].next).toBeUndefined();
        expect(playbackTree.stack[0].right).toEqual(input[1]);
        expect(playbackTree.stack[0].left).toEqual(input[2]);
      });
    });
  });
});
