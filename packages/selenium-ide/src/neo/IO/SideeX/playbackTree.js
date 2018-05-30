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

    // for continue
    let whileTimesIndexes = [];
    let doIndexes = [];
    let ifIndexes = [];
    let nextRepeatIfContinueIndex = {index: undefined};
    for(let i = this.commands.length-1; i>=0; i--) {
      this.inverseExtCommandSwitcher(i, endIndexes);
      if (this.isControlFlowFunction(this.commands[i].command)) {
        this.inverseControlFlowSwitcher(i, endBlockIndexes);
      }
    }

    for(let i = 0; i < this.commands.length; i++) {
      if (this.isControlFlowFunction(this.commands[i].command)) {
        this.controlFlowSwitcher(i, blocks, doBlockIndexes);
        this.continueProcessor(i, whileTimesIndexes, doIndexes, ifIndexes, nextRepeatIfContinueIndex);
      }
    }

    this.executionNodes = this.commands;
  }

  continueProcessor(i, loopIndexes, doIndexes, ifIndexes, nextRepeatIfContinueIndex) {
    let loops = ["times", "while"];
    if (loops.includes(this.com(i).command)) {
      loopIndexes.push(i);
    } else if (this.com(i).command === "do") {
      doIndexes.push(i);
    } else if (this.com(i).command === "if") {
      ifIndexes.push(i);
    } else if (this.com(i).command === "continue") {
      if (doIndexes.length === 0) {
        this.com(i).setRight(this.com(loopIndexes[loopIndexes.length-1]));
        this.com(i).setLeft(undefined);
      }
      if (loopIndexes[loopIndexes.length-1] > doIndexes[doIndexes.length-1]) {
        this.com(i).setRight(this.com(loopIndexes[loopIndexes.length-1]));
        this.com(i).setLeft(undefined);
      } else {
        nextRepeatIfContinueIndex.index = i;
      }
    } else if (this.com(i).command === "end") {
      if (loopIndexes[loopIndexes-1] > ifIndexes[ifIndexes-1] ) {
        loopIndexes.pop();
      } else {
        ifIndexes.pop();
      }
    } else if (this.com(i).command === "repeatIf") {
      doIndexes.pop();
      if(nextRepeatIfContinueIndex.index) {
        this.com(nextRepeatIfContinueIndex.index).setRight(this.com(i));
        this.com(nextRepeatIfContinueIndex.index).setLeft(undefined);
      }
    }
  }

  // continueProcessor(i, loopIndexes, ifIndexes) {
  //   let loops = ["times", "while"];
  //   if (loops.includes(this.com(i).command)) {
  //     loopIndexes.push(i);
  //   } else if (this.com(i).command === "if") {
  //     ifIndexes.push(i);
  //   } else if (this.com(i).command === "continue") {
  //     this.com(i).setRight(loopIndexes[loopIndexes.length-1]);
  //     this.com(i).setLeft(undefined);
  //   } else if (this.com(i).command === "end") {
  //     loopIndexes.pop();
  //     ifIndexes.pop();
  //   }
  // }

  inverseExtCommandSwitcher(i, endIndexes) {
    if (!this.isControlFlowFunction(this.com(i).command)) {
      // commands preceding 'else', 'elseIf' will point to appropriate end in the right
      if (endIndexes.length > 0 && ["else", "elseIf"].includes(this.com(i+1).command)) {
        this.com(i).setRight(this.com(endIndexes[endIndexes.length-1]));
      } else {
        this.com(i).setRight(this.com(i+1));
      }

      this.com(i).setLeft(undefined);
    } else if (this.com(i).command === "end") {
      endIndexes.push(i);
    } else if (["if", "times", "while"].includes(this.com(i).command)) {
      endIndexes.pop();
    }
  }

  inverseControlFlowSwitcher(i, endBlockIndexes) {
    let lastEndBlockIndex;
    switch(this.com(i).command) {
      case "if":
      case "elseIf":
        lastEndBlockIndex = endBlockIndexes.pop();
        if (this.commands[lastEndBlockIndex].command === "elseIf") {
          this.com(i).setRight(this.com(i+1));
          this.com(i).setLeft(this.com(lastEndBlockIndex));
        } else {
          this.com(i).setRight(this.com(i+1));
          this.com(i).setLeft(this.com(lastEndBlockIndex + 1));
        }
        if (this.com(i).command === "elseIf") {
          endBlockIndexes.push(i);
        }
        break;
      case "times":
      case "while":
        this.com(i).setRight(this.com(i+1));
        this.com(i).setLeft(this.com(endBlockIndexes.pop() + 1));
        break;
      case "else":
        this.com(i).setRight(this.com(endBlockIndexes.pop() + 1));
        this.com(i).setLeft(undefined);
        endBlockIndexes.push(i);
        break;
      case "end":
        this.com(i).setLeft(undefined);
        endBlockIndexes.push(i);
        break;
      default:
        window.addLog(`Unknown control flow operator "${this.com(i).command}"`);
    }
  }

  controlFlowSwitcher(i, blocks, doBlockIndexes) {
    if (["if", "else", "while", "elseIf", "times"].includes(this.com(i).command)) {
      if (["else", "elseIf"].includes(this.com(i).command)) {
        // treat if-elseif-else constructions as closed blocks
        blocks.pop();
      }
      blocks.push(this.com(i));
    } else if (this.com(i).command === "end") {
      let lastBlock = blocks.pop();
      if(["if", "else", "elseIf"].includes(lastBlock.command)) {
        this.com(i).setRight(this.com(i+1));
      } else if (lastBlock.command === "while" || lastBlock.command === "times" ) {
        this.com(i).setRight(lastBlock);
      }
    } else if (this.com(i).command === "do") {
      this.com(i).setLeft(undefined);
      this.com(i).setRight(this.com(i+1));
      doBlockIndexes.push(i);
    } else if (this.com(i).command === "repeatIf") {
      this.com(i).setLeft(this.com(i+1));
      this.com(i).setRight(this.com(doBlockIndexes.pop()));
    } else {
      window.addLog(`Unknown control flow operator "${this.com(i).command}"`);
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
