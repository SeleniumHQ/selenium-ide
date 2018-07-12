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

import TestCaseEmitter from "../src/testcase";

describe("test case code emitter", () => {
  it("should emit an empty test case", () => {
    const test = {
      id: "1",
      name: "example test case",
      commands: []
    };
    return expect(TestCaseEmitter.emit(test)).resolves.toEqual({
      name: "example test case",
      test: `it("${test.name}", async () => {await tests.example_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`,
      function: "tests.example_test_case = async function example_test_case(driver, vars) {}"
    });
  });
  it("should emit a test with a single command", () => {
    const test = {
      id: "1",
      name: "example test case",
      commands: [{
        command: "open",
        target: "/",
        value: ""
      }]
    };
    return expect(TestCaseEmitter.emit(test)).resolves.toEqual({
      name: "example test case",
      test: `it("${test.name}", async () => {await tests.example_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`,
      function: `tests.example_test_case = async function example_test_case(driver, vars) {await driver.get(BASE_URL + "${test.commands[0].target}");}`
    });
  });
  it("should emit a test with multiple commands", () => {
    const test = {
      id: "1",
      name: "example test case",
      commands: [
        {
          command: "open",
          target: "/",
          value: ""
        },
        {
          command: "open",
          target: "/test",
          value: ""
        },
        {
          command: "open",
          target: "/example",
          value: ""
        }
      ]
    };
    return expect(TestCaseEmitter.emit(test)).resolves.toEqual({
      name: "example test case",
      test: `it("${test.name}", async () => {await tests.example_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`,
      function: `tests.example_test_case = async function example_test_case(driver, vars) {await driver.get(BASE_URL + "${test.commands[0].target}");await driver.get(BASE_URL + "${test.commands[1].target}");await driver.get(BASE_URL + "${test.commands[2].target}");}`
    });
  });
  it("should reject a test with failed commands", () => {
    const test = {
      id: "1",
      name: "failed test",
      commands: [
        {
          command: "doesntExist",
          target: "",
          value: ""
        },
        {
          command: "open",
          target: "/test",
          value: ""
        },
        {
          command: "notThisOne",
          target: "",
          value: ""
        }
      ]
    };
    const testErrors = {
      commands: [
        {
          command: "doesntExist",
          index: 1,
          message: new Error("Unknown command doesntExist"),
          target: "",
          value: ""
        },
        {
          command: "notThisOne",
          index: 3,
          message: new Error("Unknown command notThisOne"),
          target: "",
          value: ""
        }
      ],
      id: "1",
      name: "failed test"
    };
    return expect(TestCaseEmitter.emit(test)).rejects.toMatchObject(testErrors);
  });
  it("should hardcode errors on silenceErrors option", () => {
    const test = {
      id: "1",
      name: "silence",
      commands: [
        {
          command: "doesntExist",
          target: "",
          value: ""
        }
      ]
    };
    return expect(TestCaseEmitter.emit(test, { silenceErrors: true })).resolves.toEqual({
      name: "silence",
      test: "it(\"silence\", async () => {await tests.silence(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});",
      function: "tests.silence = async function silence(driver, vars) {throw new Error(\"Unknown command doesntExist\");}"
    });
  });
});
