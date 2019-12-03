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
import path from 'path'
import { emitTest, emitSuite, _emitMethod, _findTestByName } from '../../src'
import { project as projectProcessor } from '@seleniumhq/side-utils'

function readFile(filename) {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname,
        '..',
        '..',
        '..',
        'side-utils',
        '__test__',
        'test-files',
        filename
      )
    )
  )
}

describe('Code Export C# NUnit', () => {
  it('should export a test', async () => {
    const project = readFile('single-test.side')
    const results = await emitTest({
      baseUrl: project.url,
      test: project.tests[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a test with grid execution', async () => {
    const project = readFile('single-test.side')
    const results = await emitTest({
      baseUrl: project.url,
      test: project.tests[0],
      tests: project.tests,
      beforeEachOptions: {
        browserName: 'Firefox',
        gridUrl: 'http://localhost:4444/wd/hub',
      },
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a suite', async () => {
    const project = normalizeProject(readFile('single-suite.side'))
    const results = await emitSuite({
      baseUrl: project.url,
      suite: project.suites[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a test with a reused test method', async () => {
    const project = normalizeProject(readFile('test-case-reuse.side'))
    const results = await emitTest({
      baseUrl: project.url,
      test: project.tests[1],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a test with commands that open a new window', async () => {
    const project = normalizeProject(readFile('select-window.side'))
    const results = await emitTest({
      baseUrl: project.url,
      test: project.tests[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a suite with a reused test method', async () => {
    const project = normalizeProject(readFile('test-case-reuse.side'))
    const results = await emitSuite({
      baseUrl: project.url,
      suite: project.suites[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a suite that uses control flow commands', async () => {
    const project = normalizeProject(readFile('control-flow-suite.side'))
    const results = await emitSuite({
      baseUrl: project.url,
      suite: project.suites[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a suite with commands that open a new window inside of a reused test method', async () => {
    const project = normalizeProject(readFile('nested-select-window.side'))
    const results = await emitSuite({
      baseUrl: project.url,
      suite: project.suites[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a suite with just one new window util method when there are multiple commands that open a new window', async () => {
    const project = normalizeProject(readFile('nested-select-window-v2.side'))
    const results = await emitSuite({
      baseUrl: project.url,
      suite: project.suites[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
})

function normalizeProject(project) {
  let _project = { ...project }
  _project.suites.forEach(suite => {
    projectProcessor.normalizeTestsInSuite({ suite, tests: _project.tests })
  })
  return _project
}
