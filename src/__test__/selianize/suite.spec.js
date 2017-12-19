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

import SuiteEmitter from "../../selianize/suite";

describe("suite emitter", () => {
  it("should emit an empty suite", () => {
    const suite = {
      id: "1",
      name: "example suite",
      tests: []
    };
    expect(SuiteEmitter.emit(suite, {})).resolves.toBe(`describe("${suite.name}", () => {});`);
  });
  it("should emit a suite with a single empty test", () => {
    const tests = {
      "1": {
        id: "1",
        name: "example test case",
        commands: []
      }
    };
    const suite = {
      id: "1",
      name: "example suite",
      tests: ["1"]
    };
    expect(SuiteEmitter.emit(suite, tests)).resolves.toBe(`describe("${suite.name}", () => {it("${tests["1"].name}", () => {});});`);
  });
  it("should emit a suite with multiple empty tests", () => {
    const tests = {
      "1": {
        id: "1",
        name: "example test case",
        commands: []
      },
      "2": {
        id: "2",
        name: "second test case",
        commands: []
      },
      "3": {
        id: "3",
        name: "third test case",
        commands: []
      }};
    const suite = {
      id: "1",
      name: "example suite",
      tests: ["1", "2", "3"]
    };
    expect(SuiteEmitter.emit(suite, tests)).resolves.toBe(`describe("${suite.name}", () => {it("${tests["1"].name}", () => {});it("${tests["2"].name}", () => {});it("${tests["3"].name}", () => {});});`);
  });
});
