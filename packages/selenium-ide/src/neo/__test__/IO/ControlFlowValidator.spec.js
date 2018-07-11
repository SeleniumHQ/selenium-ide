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

describe("Control Flow Validations", () => {
  test("if-end block", () => {
    let validator = new ControlFlowValidator(["if", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  test("if-if-end-end block", () => {
    let validator = new ControlFlowValidator(["if", "if", "end", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  test("if-else-end block", () => {
    let validator = new ControlFlowValidator(["if", "else", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  test("if-elseif-end block", () => {
    let validator = new ControlFlowValidator(["if", "elseIf", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  test("if-elseif-elseif-elseif-end block", () => {
    let validator = new ControlFlowValidator(["if", "elseIf", "elseIf", "elseIf", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  test("if-while-endwhile-end block", () => {
    let validator = new ControlFlowValidator(["if", "while", "endWhile", "end"]);
    expect(validator.process()).toBeTruthy();
  });

  test("while-endwhile block", () => {
    let validator = new ControlFlowValidator(["while", "endWhile"]);
    expect(validator.process()).toBeTruthy();
  });

  test("while-if-end-endwhile block", () => {
    let validator = new ControlFlowValidator(["while", "if", "end", "endWhile"]);
    expect(validator.process()).toBeTruthy();
  });

  test("if-end-while-endwhile block", () => {
    let validator = new ControlFlowValidator(["if", "end", "while", "endWhile"]);
    expect(validator.process()).toBeTruthy();
  });
});

describe("Control Flow Invalidations", () => {
  test.skip("returns command that invalidates segment", () => {
  });

  test.skip("returns commands that invalidate segment", () => {
  });

  test("if block", () => {
    let validator = new ControlFlowValidator(["if"]);
    expect(validator.process()).toBeFalsy();
  });

  test("end-if block", () => {
    let validator = new ControlFlowValidator(["end", "if"]);
    expect(validator.process()).toBeFalsy();
  });

  test("if-if-end block", () => {
    let validator = new ControlFlowValidator(["if", "if", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  test("else-if-end block", () => {
    let validator = new ControlFlowValidator(["else", "if", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  test("if-while-end-endwhile block", () => {
    let validator = new ControlFlowValidator(["if", "while", "end", "endWhile"]);
    expect(validator.process()).toBeFalsy();
  });

  test("while-if-endwhile-end block", () => {
    let validator = new ControlFlowValidator(["while", "if", "endWhile", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  test("while-if-endwhile block", () => {
    let validator = new ControlFlowValidator(["while", "if", "endWhile"]);
    expect(validator.process()).toBeFalsy();
  });

  test("while block", () => {
    let validator = new ControlFlowValidator(["while"]);
    expect(validator.process()).toBeFalsy();
  });

  test("if-while-end block", () => {
    let validator = new ControlFlowValidator(["if", "while", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  test("if-end-while-if-endwhile block", () => {
    let validator = new ControlFlowValidator(["if", "end", "while", "if", "endWhile"]);
    expect(validator.process()).toBeFalsy();
  });

  test.skip("if-else-elseif-end block", () => {
    let validator = new ControlFlowValidator(["if", "else", "elseIf", "end"]);
    expect(validator.process()).toBeFalsy();
  });

  test.skip("while-else-endwhile block", () => {
    let validator = new ControlFlowValidator(["while", "else", "endWhile"]);
    expect(validator.process()).toBeFalsy();
  });

});
