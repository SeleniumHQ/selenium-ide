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

import SuiteValidator from "../../IO/SideeX/suiteValidator";

describe("SuiteValidator if blocks", () => {
  it("should treat as valid if-elseif-else-end block", () => {
    expect(SuiteValidator.validateCommands(["if", "elseIf", "else", "end"])).toBe(true);
  });

  it("should treat as valid if-elseif-else-end block with multiple elseIf", () => {
    expect(SuiteValidator.validateCommands(["if", "elseIf", "elseIf", "elseIf", "else", "end"])).toBe(true);
  });

  it("should treat as valid if-elseif-end block", () => {
    expect(SuiteValidator.validateCommands(["if", "else", "end"])).toBe(true);
  });

  it("should treat as valid if-end block", () => {
    expect(SuiteValidator.validateCommands(["if", "end"])).toBe(true);
  });

  it("should treat as valid if-elseif-end block", () => {
    expect(SuiteValidator.validateCommands(["if", "elseIf", "elseIf", "elseIf", "end"])).toBe(true);
  });

  it("should treat as valid if-end block with embedded loops", () => {
    expect(SuiteValidator.validateCommands(["if", "while", "end", "times", "end", "end"])).toBe(true);
  });

  it("should treat as valid if-elseif-end block with embedded do-repeatIf loop", () => {
    expect(SuiteValidator.validateCommands(["if", "else", "do", "blob", "repeatIf", "end"])).toBe(true);
  });

  it("should treat as valid if-elseif-end block with embedded loop", () => {
    expect(SuiteValidator.validateCommands(["if", "elseIf", "while", "blob", "end", "elseIf", "elseIf", "end"])).toBe(true);
  });

  it("should treat as valid while-end block", () => {
    expect(SuiteValidator.validateCommands(["while", "blob", "end"])).toBe(true);
  });

  it("should treat as valid while-end block with embedded if-else-end", () => {
    expect(SuiteValidator.validateCommands(["while", "if", "blob", "else", "end", "end"])).toBe(true);
  });

  it("should treat as valid while-end block with embedded times-end ", () => {
    expect(SuiteValidator.validateCommands(["while", "blob", "times", "blob", "end", "end"])).toBe(true);
  });

  it("should treat as valid do-repeatIf block", () => {
    expect(SuiteValidator.validateCommands(["do", "blob", "repeatIf"])).toBe(true);
  });

  it("should treat as valid do-repeatIf block with embedded if-else-end", () => {
    expect(SuiteValidator.validateCommands(["do", "if", "blob", "else", "end", "repeatIf"])).toBe(true);
  });

  it("should treat as valid do-repeatIf block with embedded times-end ", () => {
    expect(SuiteValidator.validateCommands(["do", "blob", "times", "blob", "end", "repeatIf"])).toBe(true);
  });

  it("should treat as valid do-repeatIf block with embedded continue", () => {
    expect(SuiteValidator.validateCommands(["do", "if", "continue", "end", "repeatIf"])).toBe(true);
  });

  it("should treat as valid do-repeatIf block with embedded continue with embedded times-end with embedded continue", () => {
    expect(SuiteValidator.validateCommands(["do", "blob", "times", "blob", "continue", "end", "continue", "repeatIf"])).toBe(true);
  });

  it("should treat as valid while-end block with embedded continue", () => {
    expect(SuiteValidator.validateCommands(["while", "if", "blob", "continue", "else", "continue", "end", "end"])).toBe(true);
  });

  it("should treat as valid while-end block with embedded break", () => {
    expect(SuiteValidator.validateCommands(["while", "if", "blob", "break", "else", "continue", "end", "end"])).toBe(true);
  });
});

describe("SuiteValidator failure", () => {
  it("should fail if-else-elseIf-end block", () => {
    expect(SuiteValidator.validateCommands(["if", "else", "elseIf", "end"])).not.toBe(true);
  });

  it("should fail if-else block", () => {
    expect(SuiteValidator.validateCommands(["if", "else"])).not.toBe(true);
  });

  it("should fail if-elseif-else-end block with unclosed loop", () => {
    expect(SuiteValidator.validateCommands(["if", "elseIf", "else", "while" , "end"])).not.toBe(true);
  });

  it("should fail if-elseif-else-end block with unclosed do loop", () => {
    expect(SuiteValidator.validateCommands(["if", "elseIf", "else", "do" , "end"])).not.toBe(true);
  });

  it("should fail if-elseif-else-end block with unclosed repeatIf loop", () => {
    expect(SuiteValidator.validateCommands(["if", "elseIf", "else", "repeatIf" , "end"])).not.toBe(true);
  });

  it("should fail while-end block with embedded if-else", () => {
    expect(SuiteValidator.validateCommands(["while", "if", "blob", "else", "end"])).not.toBe(true);
  });

  it("should fail while-end block with embedded unclosed times", () => {
    expect(SuiteValidator.validateCommands(["while", "blob", "times", "blob", "end"])).not.toBe(true);
  });

  it("should fail while-end block with embedded unclosed repeatIf", () => {
    expect(SuiteValidator.validateCommands(["while", "blob", "repeatIf", "blob", "end"])).not.toBe(true);
  });

  it("should fail do-repeatIf block", () => {
    expect(SuiteValidator.validateCommands(["do", "blob", "end"])).not.toBe(true);
  });

  it("should fail do-repeatIf block with embedded if-else", () => {
    expect(SuiteValidator.validateCommands(["do", "if", "blob", "else", "repeatIf"])).not.toBe(true);
  });

  it("should fail do-repeatIf block with embedded times", () => {
    expect(SuiteValidator.validateCommands(["do", "blob", "times", "blob", "repeatIf"])).not.toBe(true);
  });

  it("should fail do-repeatIf block with embedded times-end", () => {
    expect(SuiteValidator.validateCommands(["do", "blob", "times", "blob", "end"])).not.toBe(true);
  });


  it("should fail with continue outside of the loop", () => {
    expect(SuiteValidator.validateCommands(["continue", "do", "if", "blob", "else", "end", "repeatIf"])).not.toBe(true);
  });


  it("should fail with break outside of the loop", () => {
    expect(SuiteValidator.validateCommands(["break", "do", "if", "blob", "else", "end", "repeatIf"])).not.toBe(true);
  });

});
