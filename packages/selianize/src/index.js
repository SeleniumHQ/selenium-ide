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

import ConfigurationEmitter from "./configuration";
import SuiteEmitter from "./suite";
import TestCaseEmitter from "./testcase";
import CommandEmitter from "./command";
import LocationEmitter from "./location";

export default function Selianize(project) {
  return new Promise(async (res, rej) => { // eslint-disable-line no-unused-vars
    let result = "";

    result += await ConfigurationEmitter.emit(project);

    let errors = [];
    const tests = (await Promise.all(project.tests.map((test) => TestCaseEmitter.emit(test).catch(e => {
      errors.push(e);
    }))));

    if (errors.length) {
      return rej({ name: project.name, tests: errors });
    }

    const testsHashmap = project.tests.reduce((map, test, index) => {
      map[test.id] = tests[index];
      return map;
    }, {});
    const suites = (await Promise.all(project.suites.map((suite) => SuiteEmitter.emit(suite, testsHashmap))));

    const results = {
      suites: suites.map((suiteCode, index) => ({
        name: project.suites[index].name,
        persistSession: project.suites[index].persistSession,
        code: !Array.isArray(suiteCode) ? `${result}${suiteCode}` : result,
        tests: Array.isArray(suiteCode) ? suiteCode : undefined
      })),
      tests: tests.map((test) => ({
        name: test.name,
        code: test.function
      }))
    };
    return res(results);
  });
}

export function RegisterConfigurationHook(hook) {
  ConfigurationEmitter.registerHook(hook);
}

export function RegisterSuiteHook(hook) {
  SuiteEmitter.registerHook(hook);
}

export function RegisterTestHook(hook) {
  TestCaseEmitter.registerHook(hook);
}

export function RegisterEmitter(command, emitter) {
  CommandEmitter.registerEmitter(command, emitter);
}

export function ParseError(error) {
  return error.tests.map(test => (
    (`## ${test.name}\n`).concat(test.commands.map(command => (
      (`${command.index}. ${command.message}\n`)
    )).join("").concat("\n"))
  )).join("");
}

export const Location = LocationEmitter;
