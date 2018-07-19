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

import CommandEmitter from "./command";
import config from "./config";
import { convertToSnake } from "./utils";

const hooks = [];

export function emit(test, options = config) {
  return new Promise(async (res, rej) => { // eslint-disable-line no-unused-vars
    const hookResults = await Promise.all(hooks.map((hook) => hook(test)));
    const testName = convertToSnake(test.name);

    let emittedTest = `it("${test.name}", async () => {`;
    emittedTest += hookResults.map((hook) => hook.setup || "").join("");
    emittedTest += `await tests.${testName}(driver, vars);`;
    emittedTest += "await driver.getTitle().then(title => {expect(title).toBeDefined();});";
    emittedTest += hookResults.map((hook) => hook.teardown || "").join("");
    emittedTest += "});";

    let func = `tests.${testName} = async function ${testName}(driver, vars, opts) {`;
    let errors = [];
    func += (await Promise.all(test.commands.map((command, index) => (CommandEmitter.emit(command).catch(e => {
      if (options.silenceErrors) {
        return `throw new Error("${e.message}");`;
      } else {
        errors.push({
          index: index + 1,
          ...command,
          message: e
        });
      }
    }))))).join("");
    func += "}";


    errors.length ? rej({ ...test, commands: errors }) : res({ name: test.name, test: emittedTest, function: func });
  });
}

function registerHook(hook) {
  hooks.push(hook);
}

export default {
  emit,
  registerHook
};
