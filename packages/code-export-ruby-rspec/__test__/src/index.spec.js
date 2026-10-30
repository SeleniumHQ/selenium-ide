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

import fs from 'fs'
import { spawnSync } from 'child_process'
import os from 'os'
import path from 'path'
import languageExport from '../../src'
import Command from '../../src/command'

function readFile(filename) {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname,
        '..',
        '..',
        '..',
        'side-code-export',
        '__test__',
        'test-files',
        filename
      )
    )
  )
}

const options = (project) => ({
  project,
  tests: project.tests,
  enableOriginTracing: false,
  enableDescriptionAsComment: false,
  beforeEachOptions: {},
})

// Checks that the exported code compiles, with the first checker installed
const checkers = [['ruby', '-c']]
function expectValidSyntax(body) {
  const file = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'side-export-')),
    'test.rb'
  )
  fs.writeFileSync(file, body)
  for (const [command, ...args] of checkers) {
    const result = spawnSync(command, [...args, file], { encoding: 'utf8' })
    // Skip a checker that isn't installed, and fail on any other error
    if (result.error?.code === 'ENOENT') continue
    if (result.error) throw result.error
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    return
  }
}

describe('Code Export Ruby RSpec', () => {
  it('should export a test', async () => {
    const project = readFile('single-test.side')
    const results = await languageExport.emit.test({
      ...options(project),
      test: project.tests[0],
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export a test with grid execution', async () => {
    const project = readFile('single-test.side')
    const results = await languageExport.emit.test({
      ...options(project),
      test: project.tests[0],
      beforeEachOptions: {
        browserName: 'Firefox',
        gridUrl: 'http://localhost:4444/wd/hub',
      },
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export a suite', async () => {
    const project = readFile('single-suite.side')
    const results = await languageExport.emit.suite({
      ...options(project),
      suite: project.suites[0],
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export a test with a reused test method', async () => {
    const project = readFile('test-case-reuse.side')
    const results = await languageExport.emit.test({
      ...options(project),
      test: project.tests[1],
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export a suite with a reused test method', async () => {
    const project = readFile('test-case-reuse.side')
    const results = await languageExport.emit.suite({
      ...options(project),
      suite: project.suites[0],
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export a suite that uses control flow commands', async () => {
    const project = readFile('control-flow-suite.side')
    const results = await languageExport.emit.suite({
      ...options(project),
      suite: project.suites[0],
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export a test with commands that open a new window', async () => {
    const project = readFile('select-window.side')
    const results = await languageExport.emit.test({
      ...options(project),
      test: project.tests[0],
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export a suite with commands that open a new window inside of a reused test method', async () => {
    const project = readFile('nested-select-window.side')
    const results = await languageExport.emit.suite({
      ...options(project),
      suite: project.suites[0],
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export a suite with just one new window util method when there are multiple commands that open a new window', async () => {
    const project = readFile('nested-select-window-v2.side')
    const results = await languageExport.emit.suite({
      ...options(project),
      suite: project.suites[0],
    })
    expect(results.body).toMatchSnapshot()
    expectValidSyntax(results.body)
  })
  it('should export the command emitter', () => {
    expect(languageExport.emit.command).toBe(Command.emit)
  })
})
