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


// For now it iterates through commands array twice. Not sure how to avoid that for now

export default class SuiteValidator{
  constructor(commandsArray) {
    this.blocksStack = [];
    this.commandNamesArray = commandsArray.map((command) => {
      return command.command;
    });
    this.error = {};
    this.process();
  }

  process() {
    for(let i = 0; i < this.commandNamesArray.length; i++) {
      const commandName = this.commandNamesArray[i];
      if (!this.isBlockEnder(commandName)) {
        this.processBlock(commandName, i);
      } else {
        this.processBlockEnd(commandName, i);
      }
      if(this.isIntermediateValid() !== true) break;
    }
  }

  processBlock(command, index) {
    if(["else", "elseIf"].includes(command)) {
      if (this.isIfElseOpen()) {
        this.pushToStack(command);
      } else {
        this.error = {index: index, error: "Incorrect if-elseIf-else block"};
      }
    } else if (["continue", "break"].includes(command)) {
      if (!this.isLoopOpen()) {
        this.error = {index: index, error: "'continue' and 'break' can only be called inside loop"};
      }
    } else {
      this.pushToStack(command);
    }
  }

  isIfElseOpen() {
    const lastIfCommandIndex = this.blocksStack.lastIndexOf("if");
    const lastElseCommandIndex = this.blocksStack.lastIndexOf("else");
    const ifPresent = lastIfCommandIndex > -1;
    return ifPresent && lastElseCommandIndex < lastIfCommandIndex;
  }

  isLoopOpen() {
    ["times", "do", "while"].forEach((loop) => {
      if (this.blocksStack.includes(loop)) {
        return true;
      }
    });
    return false;
  }

  processBlockEnd(command, i) {
    if(this.blocksStack.length === 0) {
      this.error = {index: i, error: "Error with the syntax"};
    }
    if(command === "end") {
      this.closeEndBlock(i);
    } else {
      this.closeRepeatIfBlock(i);
    }
  }

  closeEndBlock(index) {
    if(["if", "elseIf"].includes(this.blocksStack[this.blocksStack.length-1])) {
      // remove all of the if-elseIf-else commands from the stack
      const lastIfCommandIndex = this.blocksStack.lastIndexOf("if");
      this.blocksStack.splice(lastIfCommandIndex, this.blocksStack.length-1-lastIfCommandIndex);
    } else if (this.blocksStack[this.blocksStack.length-1] === "do") {
      this.error = {index: index, error: "'do' must be enclosed with 'repeatIf'"};
    } else {
      this.blocksStack.pop();
    }
  }

  closeRepeatIfBlock(index) {
    if (this.blocksStack[this.blocksStack.length-1] === "do") {
      this.blocksStack.pop();
    } else {
      this.error = {index: index, error: "'do' must be enclosed with 'repeatIf'"};
    }
  }

  pushToStack(command) {
    this.blocksStack.push(command);
  }

  isIntermediateValid() {
    if(this.error["index"]) {
      return this.error;
    } else {
      return true;
    }
  }

  findLastCommand(commandName) {
    return this.commandNamesArray.lastIndexOf(commandName);
  }

  isValid() {
    if(this.blocksStack.length > 0) {
      this.error = {index: this.findLastCommand(this.blocksStack[this.blocksStack.length-1]), error: "Error with the syntax"};
    }
  }
}

