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

class Command {
  constructor(command) {
    Object.assign(this, command);
  }

  static load(command) {
    switch(command.name) {
      case "if":
        return new If(command);
      case "else":
      case "elseIf":
        return new Else(command);
      case "while":
        return new While(command);
      case "times":
        return new Times(command);
      case "repeatIf":
        return new RepeatIf(command);
      case "do":
        return new Do(command);
      case "end":
        return new End(command);
      default:
        return new Default(command);
    }
  }

  isControlFlowCommand() {
    return !!(["if", "else", "elseIf", "do",
      "times", "while", "repeatIf", "end"].find(n => n === this.name));
  }

  isLoop() {
    return !!(["times", "while", "repeatIf"].find(n => n === this.name));
  }

  isIf() {
    return !!(["if"].find(n => n === this.name));
  }

  isEnd() {
    return !!(["end"].find(n => n === this.name));
  }
}

class If extends Command {
  constructor(command) {
    super(command);
  }

  preprocess(commandStackHandler) {
    commandStackHandler.store();
    commandStackHandler.setState();
    commandStackHandler.increaseLevel();
  }
}

class Else extends Command {
  constructor(command) {
    super(command);
  }

  preprocess(commandStackHandler) {
    if (commandStackHandler.top().name !== "if") {
      throw "An else / elseIf used outside of an if block";
    }
    commandStackHandler.decreaseLevel();
    commandStackHandler.store();
    commandStackHandler.increaseLevel();
  }
}

class While extends Command {
  constructor(command) {
    super(command);
  }

  preprocess(commandStackHandler) {
    if (commandStackHandler.top().name === "do") {
      commandStackHandler.store();
    } else {
      commandStackHandler.store();
      commandStackHandler.setState();
      commandStackHandler.increaseLevel();
    }
  }
}

class Do extends Command {
  constructor(command) {
    super(command);
  }

  preprocess(commandStackHandler) {
    commandStackHandler.store();
    commandStackHandler.setState();
    commandStackHandler.increaseLevel();
  }
}

class Times extends Command {
  constructor(command) {
    super(command);
  }

  preprocess(commandStackHandler) {
    commandStackHandler.store();
    commandStackHandler.setState();
    commandStackHandler.increaseLevel();
  }
}

class RepeatIf extends Command {
  constructor(command) {
    super(command);
  }

  preprocess(commandStackHandler) {
    if (commandStackHandler.top().name !== "do") {
      throw "A repeatIf used without a do block";
    }
    commandStackHandler.store();
  }
}

class End extends Command {
  constructor(command) {
    super(command);
  }

  preprocess(commandStackHandler) {
    if (commandStackHandler.terminatesLoop()) {
      commandStackHandler.decreaseLevel();
      commandStackHandler.store();
      commandStackHandler.popState();
    } else if (commandStackHandler.terminatesIf()) {
      const elseCount = commandStackHandler.currentSegment().filter(command => command.name === "else").length;
      const elseSegment = commandStackHandler.currentSegment().filter(command => command.name.match(/else/));
      if (elseCount > 1) {
        throw "Too many else commands used";
      } else if (elseCount === 1 && commandStackHandler.topOf(elseSegment).name !== "else") {
        throw "Incorrect command order of elseIf / else";
      } else if (elseCount === 0 || commandStackHandler.topOf(elseSegment).name === "else") {
        commandStackHandler.decreaseLevel();
        commandStackHandler.store();
        commandStackHandler.popState();
      }
    } else {
      throw "Use of end without an opening keyword";
    }
  }

}

class Default extends Command {
  constructor(command) {
    super(command);
  }

  preprocess(commandStackHandler) {
    commandStackHandler.store();
  }
}

class CommandStackHandler {
  constructor(stack) {
    this._stack = stack;
    this.stack = [];
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
    let node = new CommandNode;
    node.command = this.currentCommand;
    node.level = this.level;
    this.stack.push(node);
  }

  setState() {
    this.state.push({ name: this.currentCommand.name, index: this.currentCommandIndex });
  }

  popState() {
    this.state.pop();
  }

  top() {
    let command = this.state[this.state.length - 1];
    if (command) {
      return this.state[this.state.length - 1];
    } else {
      return { name: "" };
    }
  }

  topOf(segment) {
    return segment[segment.length - 1];
  }

  terminatesIf() {
    return (this.top().name === "if");
  }

  terminatesLoop() {
    return (this.top().name === "while" ||
            this.top().name === "times" ||
            this.top().name === "do");
  }

  currentSegment() {
    return this._stack.slice(this.top().index, this.currentCommandIndex);
  }

  setCurrentCommand(command, index) {
    this.currentCommand = command;
    this.currentCommandIndex = index;
  }

  confirm() {
    if (this.state.length > 0) {
      throw "Incomplete block at " + this.top().name;
    }
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
    this.preprocessStack = [];
    this.processStack = [];
  }

  preprocess() {
    let commandStackHandler = new CommandStackHandler(this.inputStack);
    this.inputStack.forEach(function(currentCommand, currentCommandIndex) {
      let command = Command.load(currentCommand);
      commandStackHandler.setCurrentCommand(command, currentCommandIndex);
      command.preprocess(commandStackHandler);
    });
    commandStackHandler.confirm();
    this.preprocessStack = commandStackHandler.stack;
    return this.preprocessStack;
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
    let _stack = this.preprocessStack;
    let stack = this.processStack;
    let nextNodeAtSameLevel = this.nextNodeAtSameLevel;
    let nextEndNode = this.nextEndNode;
    let previousOpeningNode = this.previousOpeningNode;
    _stack.forEach(function(currentCommandNode, index) {
      let nextCommandNode = _stack[index + 1];
      if (nextCommandNode) {
        if (currentCommandNode.command.isControlFlowCommand() &&
            !currentCommandNode.command.isEnd()) {
          currentCommandNode.right = nextCommandNode;
          currentCommandNode.left = nextNodeAtSameLevel(_stack, index, currentCommandNode.level);
        } else if (nextCommandNode.command.isControlFlowCommand()) {
          let openingNode;
          openingNode = previousOpeningNode(_stack, index, currentCommandNode.level);
          if (openingNode && !openingNode.command.isLoop()) {
            currentCommandNode.next = nextEndNode(_stack, index, openingNode.level);
          } else {
            currentCommandNode.next = openingNode;
          }
        } else {
          currentCommandNode.next = nextCommandNode;
        }
      }
      stack.push(currentCommandNode);
    });
  }

}

describe("Control Flow", () => {
  describe("Preprocess", () => {
    describe("Leveling", () => {
      test("returns leveled command stack", () => {
        let _playbackTree = new PlaybackTree([
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
        let playbackTree = _playbackTree.preprocess();
        expect(playbackTree[0].level).toEqual(0); //  if
        expect(playbackTree[1].level).toEqual(1); //    command
        expect(playbackTree[2].level).toEqual(0); //  else
        expect(playbackTree[3].level).toEqual(1); //    while
        expect(playbackTree[4].level).toEqual(2); //      command
        expect(playbackTree[5].level).toEqual(1); //    end
        expect(playbackTree[6].level).toEqual(1); //    do
        expect(playbackTree[7].level).toEqual(2); //      command
        expect(playbackTree[8].level).toEqual(2); //      while
        expect(playbackTree[9].level).toEqual(1); //    end
        expect(playbackTree[10].level).toEqual(1); //   do
        expect(playbackTree[11].level).toEqual(2); //     command
        expect(playbackTree[12].level).toEqual(2); //     repeatIf
        expect(playbackTree[13].level).toEqual(1); //   end
        expect(playbackTree[14].level).toEqual(0); // end
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
    describe("Linked List Validation", () => {
      test("command-command", () => {
        let input = [
          { name: "command1" },
          { name: "command2" }
        ];
        let playbackTree = new PlaybackTree(input);
        playbackTree.preprocess();
        playbackTree.process();
        expect(playbackTree.processStack[0].command).toEqual(input[0]);
        expect(playbackTree.processStack[1].command).toEqual(input[1]);
        expect(playbackTree.processStack[0].next).toEqual(playbackTree.processStack[1]);
        expect(playbackTree.processStack[0].left).toBeUndefined();
        expect(playbackTree.processStack[0].right).toBeUndefined();
        expect(playbackTree.processStack[1].next).toBeUndefined();
        expect(playbackTree.processStack[1].left).toBeUndefined();
        expect(playbackTree.processStack[1].right).toBeUndefined();
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
        playbackTree.process();
        let stack = playbackTree.processStack;
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
        playbackTree.process();
        let stack = playbackTree.processStack;
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
        playbackTree.process();
        let stack = playbackTree.processStack;
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
        playbackTree.process();
        let stack = playbackTree.processStack;
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
