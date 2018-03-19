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

import SuiteEmitter from "../src/suite";

describe("suite emitter", () => {
  it("should emit an empty suite", () => {
    const suite = {
      id: "1",
      name: "example suite",
      tests: []
    };
    return expect(SuiteEmitter.emit(suite, {})).resolves.toBe(`describe("${suite.name}", () => {});`);
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
    return expect(SuiteEmitter.emit(suite, tests)).resolves.toBe(`describe("${suite.name}", () => {it("${tests["1"].name}", () => {const driver = Runner.getDriver();return driver.then(() => {return driver.getTitle().then(title => {expect(title).toBeDefined();Runner.releaseDriver(driver);});}).catch((e) => (Runner.releaseDriver(driver).then(() => {throw e;})));});});`);
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
    return expect(SuiteEmitter.emit(suite, tests)).resolves.toBe(`describe("${suite.name}", () => {it("${tests["1"].name}", () => {const driver = Runner.getDriver();return driver.then(() => {return driver.getTitle().then(title => {expect(title).toBeDefined();Runner.releaseDriver(driver);});}).catch((e) => (Runner.releaseDriver(driver).then(() => {throw e;})));});it("${tests["2"].name}", () => {const driver = Runner.getDriver();return driver.then(() => {return driver.getTitle().then(title => {expect(title).toBeDefined();Runner.releaseDriver(driver);});}).catch((e) => (Runner.releaseDriver(driver).then(() => {throw e;})));});it("${tests["3"].name}", () => {const driver = Runner.getDriver();return driver.then(() => {return driver.getTitle().then(title => {expect(title).toBeDefined();Runner.releaseDriver(driver);});}).catch((e) => (Runner.releaseDriver(driver).then(() => {throw e;})));});});`);
  });
  it("should reject a suite with failed tests", () => {
    const tests = {
      "1": {
        id: "1",
        name: "first failure",
        commands: [
          {
            command: "fail",
            target: "",
            value: ""
          }
        ]
      },
      "2": {
        id: "2",
        name: "another failure",
        commands: [
          {
            command: "fail",
            target: "",
            value: ""
          }
        ]
      }
    };
    const suite = {
      id: "1",
      name: "failed suite",
      tests: ["1", "2"]
    };
    return expect(SuiteEmitter.emit(suite, tests)).rejects.toMatchObject({
      id: "1",
      name: "failed suite",
      tests: [
        {
          commands: [
            {
              command: "fail",
              index: 1,
              message: "Unknown command fail",
              target: "",
              value: ""
            }
          ],
          id: "1",
          name: "first failure"
        },
        {
          commands: [
            {
              command: "fail",
              index: 1,
              message: "Unknown command fail",
              target: "",
              value: ""
            }
          ],
          id: "2",
          name: "another failure"
        }
      ]
    });
  });
});
