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

export default class ControlFlowValidator {
  constructor(commandStack) {
    this.commandStack = commandStack;
    this.commandKeywordPairs = [
      ["if", "end"],
      ["while", "endWhile"]
    ];
  }

  process() {
    if (this.isBoundByACompleteSegment()) {
      if (this.hasIncompleteCommandSegments()) {
        return false;
      } else {
        return true;
      }
    } else if (this.hasMoreThanOneCompleteSegment()) {
      if (this.segmentsContainIncompleteSegments()) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  segmentsContainIncompleteSegments() {
    //let keywordIndices = [];
    //let stack = this.commandStack;
    //this.commandKeywordPairs.forEach(function(keywordPair) {
    //  keywordIndices.push([
    //    stack.indexOf(keywordPair[0]),
    //    stack.indexOf(keywordPair[1])
    //  ]);
    //});
    //console.log(keywordIndices);
    const ifIndex = this.commandStack.indexOf("if");
    const endIndex = this.commandStack.indexOf("end");
    const segment1 = this.commandStack.slice(ifIndex, endIndex + 1);
    const whileIndex = this.commandStack.indexOf("while");
    const endWhileIndex = this.commandStack.indexOf("endWhile");
    const segment2 = this.commandStack.slice(whileIndex, endWhileIndex + 1);
    return (this.hasIncompleteCommandSegments(segment1) || this.hasIncompleteCommandSegments(segment2));
  }

  startsWith(command) {
    return this.commandStack[0] === command;
  }

  endsWith(command) {
    return this.commandStack[this.commandStack.length - 1] === command;
  }

  commandCount(commandName, segment) {
    const stack = (segment ? segment : this.commandStack);
    return stack.filter(command => command === commandName).length;
  }

  isBoundByACompleteSegment() {
    return (this.startsWith("if") && this.endsWith("end") ||
            this.startsWith("while") && this.endsWith("endWhile"));
  }

  hasIncompleteCommandSegments(segment) {
    return (this.commandCount("if", segment) !== this.commandCount("end", segment) ||
            this.commandCount("while", segment) !== this.commandCount("endWhile", segment));
  }

  hasMoreThanOneCompleteSegment() {
    return ((this.commandCount("if") > 0 && this.commandCount("if") === this.commandCount("end")) &&
            (this.commandCount("while") > 0 && this.commandCount("while") === this.commandCount("endWhile")));
  }
}
