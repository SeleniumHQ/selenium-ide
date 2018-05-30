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
    let endIndexes = [];
    let endBlockIndexes = [];
    let blocks = [];
    let doBlockIndexes = [];
    for(let i = this.commands.length-1; i>=0; i--) {
      this.inverseExtCommandSwitcher(i, endIndexes);
      if (this.isControlFlowFunction(this.commands[i].command)) {
        this.inverseControlFlowSwitcher(i, endBlockIndexes);
      }
    }

    for(let i = 0; i < this.commands.length; i++) {
      if (this.isControlFlowFunction(this.commands[i].command)) {
        this.controlFlowSwitcher(i, blocks, doBlockIndexes);
      }
    }

    this.executionNodes = this.commands;
  }

  inverseExtCommandSwitcher(index, endIndexes) {
    if (!this.isControlFlowFunction(this.com(index).command)) {
      // commands preceding 'else', 'elseIf' will point to appropriate end in the right
      if (endIndexes.length > 0 && ["else", "elseIf"].includes(this.com(index+1).command)) {
        this.com(index).setRight(this.com(endIndexes[endIndexes.length-1]));
      } else {
        this.com(index).setRight(this.com(index+1));
      }

      this.com(index).setLeft(undefined);
    } else if (this.com(index).command === "end") {
      endIndexes.push(index);
    } else if (["if", "times", "while"].includes(this.com(index).command)) {
      endIndexes.pop();
    }
  }

  inverseControlFlowSwitcher(index, endBlockIndexes) {
    let lastEndBlockIndex;
    switch(this.com(index).command) {
      case "if":
      case "elseIf":
        lastEndBlockIndex = endBlockIndexes.pop();
        if (this.commands[lastEndBlockIndex].command === "elseIf") {
          this.com(index).setRight(this.com(index+1));
          this.com(index).setLeft(this.com(lastEndBlockIndex));
        } else {
          this.com(index).setRight(this.com(index+1));
          this.com(index).setLeft(this.com(lastEndBlockIndex + 1));
        }
        if (this.com(index).command === "elseIf") {
          endBlockIndexes.push(index);
        }
        break;
      case "times":
      case "while":
        this.com(index).setRight(this.com(index+1));
        this.com(index).setLeft(this.com(endBlockIndexes.pop() + 1));
        break;
      case "else":
        this.com(index).setRight(this.com(endBlockIndexes.pop() + 1));
        this.com(index).setLeft(undefined);
        endBlockIndexes.push(index);
        break;
      case "end":
        this.com(index).setLeft(undefined);
        endBlockIndexes.push(index);
        break;
      default:
        window.addLog(`Unknown control flow operator "${this.com(index).command}"`);
    }
  }

  controlFlowSwitcher(index, blocks, doBlockIndexes) {
    if (["if", "else", "while", "elseIf", "times"].includes(this.com(index).command)) {
      if (["else", "elseIf"].includes(this.com(index).command)) {
        // treat if-elseif-else constructions as closed blocks
        blocks.pop();
      }
      blocks.push(this.com(index));
    } else if (this.com(index).command === "end") {
      let lastBlock = blocks.pop();
      if(["if", "else", "elseIf"].includes(lastBlock.command)) {
        this.com(index).setRight(this.com(index+1));
      } else if (lastBlock.command === "while" || lastBlock.command === "times" ) {
        this.com(index).setRight(lastBlock);
      }
    } else if (this.com(index).command === "do") {
      this.com(index).setLeft(undefined);
      this.com(index).setRight(this.com(index+1));
      doBlockIndexes.push(index);
    } else if (this.com(index).command === "repeatIf") {
      this.com(index).setLeft(this.com(index+1));
      this.com(index).setRight(this.com(doBlockIndexes.pop()));
    } else {
      window.addLog(`Unknown control flow operator "${this.com(index).command}"`);
    }
  }

  isControlFlowFunction(command) {
    switch(command) {
      case "if":
      case "elseIf":
      case "else":
      case "while":
      case "times":
      case "repeatIf":
      case "do":
      case "end":
      case "continue":
      case "break":
        return true;
      default:
        return false;
    }
  }

  com(index) {
    return this.commands[index];
  }

  static processCommands(commandsArray) {
    let a = new PlaybackTree(commandsArray);
    a.maintenance();
  }

  // TODO: maintenance function: remove when possible
  maintenance() {
    // runCommand(this.executionNodes[0]);
    window.addLog("maintenance");
    this.executionNodes.forEach((node) => {
      window.addLog(`[[ Command: ]] ${node.command}`);
      if (node.left) {
        window.addLog(`[[ Command left direction: ]] ${node.left.command}`);
      } else {
        window.addLog(`[[ Command left direction: ]] not defined`);
      }
      if (node.right) {
        window.addLog(`[[ Command right direction: ]] ${node.right.command}`);
      } else {
        window.addLog(`[[ Command right direction: ]] not defined`);
      }
      window.addLog(`----------------------`);
    });
  }
}
