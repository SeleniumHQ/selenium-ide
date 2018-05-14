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

export default class PlaybackTree{
  constructor(commandsArray) {
    this.commands = commandsArray;
    this.process();
  }

  process() {
    // TODO: Make sure to clone commands in order to skip re-renders on UI
    let endBlockIndexes = [];
    let blocks = [];
    for(let i = this.commands.length-1; i>=0; i--) {
      if (!this.isControlFlowFunction(this.commands[i].command)) {
        this.commands[i].setRight(this.commands[i+1]);
        this.commands[i].setLeft(undefined);
        // TODO: do not rely on left and right to be undefined on closing execution
      } else {
        this.inverseControlFlowSwitcher(this.commands[i], i, endBlockIndexes);
      }
    }

    for(let i = 0; i < this.commands.length; i++) {
      if (this.isControlFlowFunction(this.commands[i].command)) {
        this.controlFlowSwitcher(this.commands[i], i, blocks);
      }
    }

    this.executionNodes = this.commands;
  }

  inverseControlFlowSwitcher(command, index, endBlockIndexes) {
    switch(command.command) {
      case "if":
      case "while":
        command.setRight(this.commands[index+1]);
        command.setLeft(this.commands(endBlockIndexes.pop() + 1));
        break;
      case "else":
        command.setRight(this.commands(endBlockIndexes.pop() + 1));
        command.setLeft(undefined);
        endBlockIndexes.push(index);
        break;
      case "end":
        command.setLeft(undefined);
        endBlockIndexes.push(index);
    }
  }

  controlFlowSwitcher(command, index, blocks) {
    if (["if", "else", "while"].includes(command.command)) {
      blocks.push(command);
    } else if (command.command === "end") {
      let lastBlock = blocks.pop();
      if(["if", "else"].includes(lastBlock.command)) {
        command.setRight(this.commands[index+1]);
      } else if (lastBlock.command === "while") {
        command.setRight(lastBlock);
      }
    } else {
      throw new Error("Unknown control flow operator");
    }
  }

  // TODO: avoid duplicates with TestTable
  isControlFlowFunction(command) {
    return this.isBlock(command) || this.isBlockEnd(command);
  }

  // TODO: do, times
  isBlock(command) {
    switch(command) {
      case "if":
      case "while":
      case "else":
        return true;
      default:
        return false;
    }
  }

  // TODO: endDo
  isBlockEnd(command) {
    switch(command) {
      case "end":
      case "else":
        return true;
      default:
        return false;
    }
  }

  // TODO: maintenance function: remove when possible
  maintenance() {

    runCommand(this.executionNodes[0]);

    function runCommand(command) {
      console.log(command.command);
      if (command.right) {
        runCommand(command.right);
      }
    }
  }

}