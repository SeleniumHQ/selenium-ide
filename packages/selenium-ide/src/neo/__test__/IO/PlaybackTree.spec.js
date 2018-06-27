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

class Automata {
  constructor(stack) {
    this.stack = stack;
  }

  process() {
    let stack = this.stack;
    let _stack = [];
    let topOf = this.topOf;
    stack.forEach(function(commandName, index) {
      switch(commandName) {
        case "if":
        case "while":
        case "times":
        case "repeatIf":
          _stack.push({ name: commandName, index: index });
          break;
        case "else":
        case "elseIf":
          if (topOf(_stack).name !== "if") {
            throw "An else / elseIf used outside of an if block";
          }
          break;
        case "end":
          if (topOf(_stack).name === "while" ||
              topOf(_stack).name === "times" ||
              topOf(_stack).name === "repeatIf") {
            _stack.pop();
          } else if (topOf(_stack).name === "if") {
            const segment = stack.slice(topOf(_stack).index, index);
            const elseCount = segment.filter(name => name === "else").length;
            if (elseCount > 1) {
              throw "Too many else commands used";
            } else if (elseCount === 1 && topOf(segment) !== "else") {
              throw "Incorrect command order of elseIf / else";
            } else if (elseCount === 0 || topOf(segment) === "else") {
              _stack.pop();
            }
          }
          break;
      }
    });
    if (_stack.length > 0) {
      throw "Incomplete block at " + topOf(_stack).name;
    } else {
      return true;
    }
  }

  topOf(stack) {
    return stack[stack.length - 1];
  }

}

describe("Control Flow Validation", () => {
  test("if", () => {
    let automata = new Automata(["if"]);
    expect(function() { automata.process(); }).toThrow("Incomplete block at if");
  });
  test("if, if, end", () => {
    let automata = new Automata(["if", "if", "end"]);
    expect(function() { automata.process(); }).toThrow("Incomplete block at if");
  });
  test("if, end", () => {
    let automata = new Automata(["if", "end"]);
    expect(automata.process()).toBeTruthy();
  });
  test("if, else, end", () => {
    let automata = new Automata(["if", "else", "end"]);
    expect(automata.process()).toBeTruthy();
  });
  test("if, elseIf, end", () => {
    let automata = new Automata(["if", "elseIf", "end"]);
    expect(automata.process()).toBeTruthy();
  });
  test("if, elseIf, else, end", () => {
    let automata = new Automata(["if", "elseIf", "else", "end"]);
    expect(automata.process()).toBeTruthy();
  });
  test("if, else, elseIf, end", () => {
    let automata = new Automata(["if", "else", "elseIf", "end"]);
    expect(function() { automata.process(); }).toThrow("Incorrect command order of elseIf / else");
  });
  test("if, else, else, end", () => {
    let automata = new Automata(["if", "else", "else", "end"]);
    expect(function() { automata.process(); }).toThrow("Too many else commands used");
  });
  test("while", () => {
    let automata = new Automata(["while"]);
    expect(function() { automata.process(); }).toThrow("Incomplete block at while");
  });
  test("while, end", () => {
    let automata = new Automata(["while", "end"]);
    expect(automata.process()).toBeTruthy();
  });
  test("if, while", () => {
    let automata = new Automata(["if", "else", "elseIf", "while"]);
    expect(function() { automata.process(); }).toThrow("Incomplete block at while");
  });
  test("if, while, end", () => {
    let automata = new Automata(["if", "else", "elseIf", "while", "end"]);
    expect(function() { automata.process(); }).toThrow("Incomplete block at if");
  });
  test("if, while, else, end", () => {
    let automata = new Automata(["if", "else", "elseIf", "while", "else", "end"]);
    expect(function() { automata.process(); }).toThrow("An else / elseIf used outside of an if block");
  });
  test("times", () => {
    let automata = new Automata(["times"]);
    expect(function() { automata.process(); }).toThrow("Incomplete block at times");
  });
  test("times, end", () => {
    let automata = new Automata(["times", "end"]);
    expect(automata.process()).toBeTruthy();
  });
  test("repeatIf", () => {
    let automata = new Automata(["repeatIf"]);
    expect(function() { automata.process(); }).toThrow("Incomplete block at repeatIf");
  });
  test("repeatIf, end", () => {
    let automata = new Automata(["repeatIf", "end"]);
    expect(automata.process()).toBeTruthy();
  });
  test("repeatIf, if", () => {
    let automata = new Automata(["repeatIf", "if"]);
    expect(function() { automata.process(); }).toThrow("Incomplete block at if");
  });
  test("repeatIf, if, end, end", () => {
    let automata = new Automata(["repeatIf", "if", "end", "end"]);
    expect(automata.process()).toBeTruthy();
  });
});
