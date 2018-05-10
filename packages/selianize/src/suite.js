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

import TestCaseEmitter from "./testcase";

const hooks = [];

export function emit(suite, tests) {
  return new Promise(async (res, rej) => { // eslint-disable-line no-unused-vars
    const hookResults = (await Promise.all(hooks.map((hook) => hook({name: suite.name})))).reduce((code, result) => (
      code
      + (result.beforeAll ? `beforeAll(async () => {${result.beforeAll}});` : "")
      + (result.before ? `beforeEach(async () => {${result.before}});` : "")
      + (result.after ? `afterEach(async () => {${result.after}});` : "")
      + (result.afterAll ? `afterAll(async () => {${result.afterAll}});` : "")
    ), "");
    let errors = [];
    let testsCode = (await Promise.all(suite.tests.map(testId => (
      tests[testId]
    )).map((test) => (TestCaseEmitter.emit(test).catch(e => {
      errors.push(e);
    })))));

    if (suite.parallel) {
      testsCode = testsCode.map((code, index) => ({
        name: tests[suite.tests[index]].name,
        code: code.replace(/^it/, `jest.setTimeout(${suite.timeout * 1000});test`)
      }));
      return res(testsCode);
    }

    let result = `jest.setTimeout(${suite.timeout * 1000});describe("${suite.name}", () => {${hookResults}`;

    result += testsCode.join("");

    result += "});";
    errors.length ? rej({
      ...suite,
      tests: errors
    }) : res(result);
  });
}

function registerHook(hook) {
  hooks.push(hook);
}

export default {
  emit,
  registerHook
};
