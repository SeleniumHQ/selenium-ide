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

export default class PlaybackTree{
  constructor(commandsArray) {
    this.commands = commandsArray;
    this.execute();
  }

  execute() {
    for(let i = this.commands.length; i>=0; i--) {
      if (this.isControlFlowFunction(this.commands[i].command)) {
        this.commands[i].setLeft(undefined);
        this.commands[i].setRight(this.commands[i+1]);
        // TODO: do not rely on left and right to be undefined on closing execution
      } else {
        // TODO: process control flow command and determine left and right for them
      }
    }
    this.executionNodes = this.commands;
  }

  isControlFlowFunction(command) {
    return this.isBlock(command) || this.isBlockEnd(command);
  }

  isBlock(command) {
    switch(command) {
      case "if":
      case "do":
      case "while":
      case "times":
      case "else":
        return true;
      default:
        return false;
    }
  }

  isBlockEnd(command) {
    switch(command) {
      case "end":
      case "endDo":
      case "else":
        return true;
      default:
        return false;
    }
  }

}