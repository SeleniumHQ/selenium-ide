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
    return expect(TestCaseEmitter.emit(test)).resolves.toBe(`it("${test.name}", () => {const driver = Runner.getDriver();return driver.then(() => {return driver.getTitle().then(title => {expect(title).toBeDefined();Runner.releaseDriver(driver);});}).catch((e) => (Runner.releaseDriver(driver).then(() => {throw e;})));});`);
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
    return expect(TestCaseEmitter.emit(test)).resolves.toBe(`it("${test.name}", () => {const driver = Runner.getDriver();return driver.then(() => {driver.get(BASE_URL + "${test.commands[0].target}");return driver.getTitle().then(title => {expect(title).toBeDefined();Runner.releaseDriver(driver);});}).catch((e) => (Runner.releaseDriver(driver).then(() => {throw e;})));});`);
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
    return expect(TestCaseEmitter.emit(test)).resolves.toBe(`it("${test.name}", () => {const driver = Runner.getDriver();return driver.then(() => {driver.get(BASE_URL + "${test.commands[0].target}");driver.get(BASE_URL + "${test.commands[1].target}");driver.get(BASE_URL + "${test.commands[2].target}");return driver.getTitle().then(title => {expect(title).toBeDefined();Runner.releaseDriver(driver);});}).catch((e) => (Runner.releaseDriver(driver).then(() => {throw e;})));});`);
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
          message: "Unknown command doesntExist",
          target: "",
          value: ""
        },
        {
          command: "notThisOne",
          index: 3,
          message: "Unknown command notThisOne",
          target: "",
          value: ""
        }
      ],
      id: "1",
      name: "failed test"
    };
    return expect(TestCaseEmitter.emit(test)).rejects.toMatchObject(testErrors);
  });
});
