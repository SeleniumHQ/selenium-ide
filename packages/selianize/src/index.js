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

import ConfigurationEmitter from './configuration'
import SuiteEmitter from './suite'
import TestCaseEmitter from './testcase'
import CommandEmitter from './command'
import LocationEmitter from './location'
import config from './config'
import utils from './utils'

/**
 * @typedef Project a Selenium IDE project (.side)
 * @property {string} id the id of the project
 * @property {string} name the name of the project
 * @property {string} url
 * @property {Test[]} tests
 * @property {Suite[]} suites
 * @property {string[]} urls
 * @property {any[]} plugins
 * @property {string} version
 *
 * @typedef Suite a suite of tests
 * @property {string} id the suite's id
 * @property {string} name the name of the suite
 * @property {boolean} parallel
 * @property {number} timeout
 * @property {string[]} tests an array of test id's
 *
 * @typedef Test a test
 * @property {string} id the id of the test
 * @property {string} name the name of the test
 * @property {Command[]} commands the name of the test
 *
 * @typedef Command a command
 * @property {string} id
 * @property {string} comment
 * @property {string} command
 * @property {string} target
 * @property {string[]} targets
 * @property {string} value
 *
 */

/**
 * Exports a Selenium IDE project (.side) to executable javascript code
 * @param {Project} project
 * @param {{ silenceErrors?: boolean, skipStdLibEmitting?: boolean }} _opts
 * @param {*} snapshot
 */
export default function Selianize(project, _opts, snapshot = {}) {
  const options = { ...config, ..._opts }
  return new Promise(async (res, rej) => {
    // eslint-disable-line no-unused-vars
    const configuration = await ConfigurationEmitter.emit(
      project,
      options,
      snapshot.globalConfig ? snapshot.globalConfig.snapshot : undefined
    )

    let errors = []
    const tests = await Promise.all(
      project.tests.map(test => {
        const testSnapshot = snapshot.tests
          ? snapshot.tests.find(snapshotTest => test.id === snapshotTest.id)
          : undefined
        return TestCaseEmitter.emit(
          test,
          options,
          testSnapshot ? testSnapshot.snapshot : undefined
        ).catch(e => {
          errors.push(e)
        })
      })
    )

    if (errors.length) {
      return rej({ name: project.name, tests: errors })
    }

    const testsHashmap = project.tests.reduce((map, test, index) => {
      map[test.id] = {
        emitted: tests[index],
        test,
      }
      return map
    }, {})
    const suites = await Promise.all(
      project.suites.map(suite =>
        SuiteEmitter.emit(
          suite,
          testsHashmap,
          options,
          snapshot.suites
            ? snapshot.suites.find(
                snapshotSuite => suite.name === snapshotSuite.name
              ).snapshot
            : undefined
        )
      )
    )

    const emittedTests = tests.filter(test => !!test.id).map(test => ({
      id: test.id,
      name: test.name,
      code: test.function,
      snapshot: test.snapshot,
    }))
    const emittedSuites = suites
      .filter(suite => !suite.skipped)
      .map((suiteCode, index) => ({
        name: project.suites[index].name,
        persistSession: project.suites[index].persistSession,
        code: !Array.isArray(suiteCode) ? suiteCode.code : undefined,
        tests: Array.isArray(suiteCode) ? suiteCode : undefined,
        snapshot: suiteCode.snapshot
          ? {
              hook: suiteCode.snapshot.hook,
            }
          : undefined,
      }))
    const results = {
      globalConfig: !configuration.skipped ? configuration : undefined,
      suites: emittedSuites.length ? emittedSuites : undefined,
      tests: emittedTests.length ? emittedTests : undefined,
    }
    if (results.globalConfig || results.suites || results.tests) {
      return res(results)
    } else {
      return res(undefined)
    }
  })
}

export function RegisterConfigurationHook(hook) {
  ConfigurationEmitter.registerHook(hook)
}

export function RegisterSuiteHook(hook) {
  SuiteEmitter.registerHook(hook)
}

export function RegisterTestHook(hook) {
  TestCaseEmitter.registerHook(hook)
}

export function RegisterEmitter(command, emitter) {
  CommandEmitter.registerEmitter(command, emitter)
}

export function ParseError(error) {
  return error.tests
    .map(test =>
      `## ${test.name}\n`.concat(
        test.commands
          .map(command => `${command.index}. ${command.message}\n`)
          .join('')
          .concat('\n')
      )
    )
    .join('')
}

export const Location = LocationEmitter
export const Command = CommandEmitter

export function getUtilsFile() {
  return utils.getUtilsFile()
}
