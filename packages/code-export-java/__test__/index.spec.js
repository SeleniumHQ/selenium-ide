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
import { emitTest, emitSuite, _emitMethod, _findTestByName } from '../src'
import { normalizeTestsInSuite } from '../../selenium-ide/src/neo/IO/normalize'

describe('Code Export Java Selenium', () => {
  it('should export a test to JUnit code', async () => {
    const project = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'test-files', 'single-test.side'))
    )
    const results = await emitTest({
      baseUrl: project.url,
      test: project.tests[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a suite to JUnit code', async () => {
    const project = normalizeProject(
      JSON.parse(
        fs.readFileSync(path.join(__dirname, 'test-files', 'single-suite.side'))
      )
    )
    const results = await emitSuite({
      baseUrl: project.url,
      suite: project.suites[0],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a test to JUnit code with reused test method', async () => {
    const project = normalizeProject(
      JSON.parse(
        fs.readFileSync(
          path.join(__dirname, 'test-files', 'test-case-reuse.side')
        )
      )
    )
    const results = await emitTest({
      baseUrl: project.url,
      test: project.tests[1],
      tests: project.tests,
    })
    expect(results.body).toBeDefined()
    expect(results.body).toMatchSnapshot()
  })
  it('should export a suite to JUnit code with reused test method', async () => {
    const project = normalizeProject(
      JSON.parse(
        fs.readFileSync(
          path.join(__dirname, 'test-files', 'test-case-reuse.side')
        )
      )
    )
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
    normalizeTestsInSuite({ suite, tests: _project.tests })
  })
  return _project
}
