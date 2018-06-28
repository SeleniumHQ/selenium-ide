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

class Automata {
  constructor(stack) {
    this.inputStack = stack;
    this.preprocessStack = [];
    this.stack = [];
  }

  preprocess() {
    let topOf = this.topOf;
    let level = 0;
    let state = [];
    let stack = [];
    Object.assign(stack, this.inputStack);
    this.inputStack.forEach(function(command, index) {
      switch(command.name) {
        case "if":
        case "while":
        case "times":
        case "repeatIf":
          Object.assign(stack[index], { level: level });
          level++;
          state.push({ name: command.name, index: index });
          break;
        case "else":
        case "elseIf":
          if (topOf(state).name !== "if") {
            throw "An else / elseIf used outside of an if block";
          }
          level--;
          Object.assign(stack[index], { level: level });
          level++;
          break;
        case "end":
          if (topOf(state).name === "while" ||
              topOf(state).name === "times" ||
              topOf(state).name === "repeatIf") {
            level--;
            Object.assign(stack[index], { level: level });
            state.pop();
          } else if (topOf(state).name === "if") {
            const segment = stack.slice(topOf(state).index, index);
            const elseCount = segment.filter(kommand => kommand.name === "else").length;
            const elseSegment = segment.filter(kommand => kommand.name.match(/else/));
            if (elseCount > 1) {
              throw "Too many else commands used";
            } else if (elseCount === 1 && topOf(elseSegment).name !== "else") {
              throw "Incorrect command order of elseIf / else";
            } else if (elseCount === 0 || topOf(elseSegment).name === "else") {
              level--;
              Object.assign(stack[index], { level: level });
              state.pop();
            }
          }
          break;
        default:
          Object.assign(stack[index], { level: level });
          break;
      }
    });
    if (state.length > 0) {
      throw "Incomplete block at " + topOf(state).name;
    } else {
      this.preprocessStack = stack;
      return this.preprocessStack;
    }
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
        console.log(leftTarget);
        for(let i = index; i < _stack.length + 1; i++) {
          if (_stack[i + 1] && (_stack[i].level === _stack[i + 1].level)) {
            console.log("HELLO!");
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
      let automataFactory = new Automata([
        { name: "if" },
        { name: "command" },
        { name: "else" },
        { name: "while" },
        { name: "command" },
        { name: "end" },
        { name: "end" }
      ]);
      let automata = automataFactory.preprocess();
      expect(automata[0].level).toEqual(0); // if
      expect(automata[1].level).toEqual(1); //   command
      expect(automata[2].level).toEqual(0); // else
      expect(automata[3].level).toEqual(1); //   while
      expect(automata[4].level).toEqual(2); //     command
      expect(automata[5].level).toEqual(1); //   end
      expect(automata[6].level).toEqual(0); // end
    });
    describe("Validation", () => {
      test("if, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "end" }]);
        expect(automata.preprocess()).toBeTruthy();
      });
      test("if, else, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "else" }, { name: "end" }]);
        expect(automata.preprocess()).toBeTruthy();
      });
      test("if, elseIf, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "elseIf" }, { name: "end" }]);
        expect(automata.preprocess()).toBeTruthy();
      });
      test("if, elseIf, else, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "elseIf" }, { name: "else" }, { name: "end" }]);
        expect(automata.preprocess()).toBeTruthy();
      });
      test("while, end", () => {
        let automata = new Automata([{ name: "while" }, { name: "end" }]);
        expect(automata.preprocess()).toBeTruthy();
      });
      test("times, end", () => {
        let automata = new Automata([{ name: "times" }, { name: "end" }]);
        expect(automata.preprocess()).toBeTruthy();
      });
      test("repeatIf, end", () => {
        let automata = new Automata([{ name: "repeatIf" }, { name: "end" }]);
        expect(automata.preprocess()).toBeTruthy();
      });
      test("repeatIf, if, end, end", () => {
        let automata = new Automata([{ name: "repeatIf" }, { name: "if" }, { name: "end" }, { name: "end" }]);
        expect(automata.preprocess()).toBeTruthy();
      });
    });
    describe("Invalidation", () => {
      test("if", () => {
        let automata = new Automata([{ name: "if" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incomplete block at if");
      });
      test("if, if, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "if" }, { name: "end" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incomplete block at if");
      });
      test("if, else, elseIf, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "end" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incorrect command order of elseIf / else");
      });
      test("if, else, else, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "else" }, { name: "else" }, { name: "end" }]);
        expect(function() { automata.preprocess(); }).toThrow("Too many else commands used");
      });
      test("while", () => {
        let automata = new Automata([{ name: "while" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incomplete block at while");
      });
      test("if, while", () => {
        let automata = new Automata([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incomplete block at while");
      });
      test("if, while, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }, { name: "end" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incomplete block at if");
      });
      test("if, while, else, end", () => {
        let automata = new Automata([{ name: "if" }, { name: "else" }, { name: "elseIf" }, { name: "while" }, { name: "else" }, { name: "end" }]);
        expect(function() { automata.preprocess(); }).toThrow("An else / elseIf used outside of an if block");
      });
      test("times", () => {
        let automata = new Automata([{ name: "times" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incomplete block at times");
      });
      test("repeatIf", () => {
        let automata = new Automata([{ name: "repeatIf" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incomplete block at repeatIf");
      });
      test("repeatIf, if", () => {
        let automata = new Automata([{ name: "repeatIf" }, { name: "if" }]);
        expect(function() { automata.preprocess(); }).toThrow("Incomplete block at if");
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
        let automata = new Automata(input);
        automata.preprocess();
        automata.process();
        expect(automata.stack[0].next).toEqual(input[1]);
      });

      test("has next and left, right for if-command-end", () => {
        let input = [
          { name: "if" },
          { name: "command" },
          { name: "end" }
        ];
        let automata = new Automata(input);
        automata.preprocess();
        automata.process();
        expect(automata.stack[0].next).toBeUndefined();
        expect(automata.stack[0].right).toEqual(input[1]);
        expect(automata.stack[0].left).toEqual(input[2]);
      });
    });
  });
});
