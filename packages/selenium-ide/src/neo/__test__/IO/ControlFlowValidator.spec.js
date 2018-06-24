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

import ControlFlowValidator from "../../IO/ControlFlowValidator";

describe("Control Flow Valdiator", () => {
  it("should invalidate a if block", () => {
    let validator = new ControlFlowValidator(["if"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should validate an if-end block", () => {
    let validator = new ControlFlowValidator(["if", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  it("should invalidate an end-if block", () => {
    let validator = new ControlFlowValidator(["end", "if"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should validate an if-if-end-end block", () => {
    let validator = new ControlFlowValidator(["if", "if", "end", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  it("should invalidate an if-if-end block", () => {
    let validator = new ControlFlowValidator(["if", "if", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should validate an if-else-end block", () => {
    let validator = new ControlFlowValidator(["if", "else", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  it("should validate an if-elseif-end block", () => {
    let validator = new ControlFlowValidator(["if", "elseIf", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  it("should validate an if-elseif-elseif-elseif-end block", () => {
    let validator = new ControlFlowValidator(["if", "elseIf", "elseIf", "elseIf", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  it("should invalidate an else-if-end block", () => {
    let validator = new ControlFlowValidator(["else", "if", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should invalidate an if-else-elseif-end block", () => {
    let validator = new ControlFlowValidator(["if", "else", "elseIf", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should validate an if-while-endwhile-end block", () => {
    let validator = new ControlFlowValidator(["if", "while", "endWhile", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  it("should invalidate an if-while-end-endwhile block", () => {
    let validator = new ControlFlowValidator(["if", "while", "end", "endWhile"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should invalidate an if-while-end block", () => {
    let validator = new ControlFlowValidator(["if", "while", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should validate a while-endwhile block", () => {
    let validator = new ControlFlowValidator(["while", "endWhile"]);
    expect(validator.process()).toBeTruthy();
  });

  it("should invalidate a while block", () => {
    let validator = new ControlFlowValidator(["while"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should validate a while-if-end-endwhile block", () => {
    let validator = new ControlFlowValidator(["while", "if", "end", "endWhile"]);
    expect(validator.process()).toBeTruthy();
  });

  it("should invalidate a while-if-endwhile-end block", () => {
    let validator = new ControlFlowValidator(["while", "if", "endWhile", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should invalidate a while-if-endwhile block", () => {
    let validator = new ControlFlowValidator(["while", "if", "endWhile"]);
    expect(validator.process()).toBeFalsy();
  });

  it("should invalidate a while-else-endwhile block", () => {
    let validator = new ControlFlowValidator(["while", "else", "endWhile"]);
    expect(validator.process()).toBeFalsy();
  });
});
