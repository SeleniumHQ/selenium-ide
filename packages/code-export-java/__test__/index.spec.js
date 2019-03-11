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
import { emitTest, emitSuite, sanitizeName, capitalize } from '../src'

describe('Code Export Java Selenium', () => {
  it('should sanitize the name', () => {
    expect(sanitizeName('blah blah')).toEqual('blahblah')
  })
  it('should capitalize the name', () => {
    expect(capitalize('blahblah')).toEqual('Blahblah')
  })
  it('should export a test to JUnit code', async () => {
    const project = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'test-files', 'single-test.side'))
    )
    const results = await emitTest({
      baseUrl: project.url,
      test: project.tests[0],
      tests: project.tests,
    })
    expect(results).toBeDefined()
    expect(results).toMatchSnapshot()
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
    expect(results).toBeDefined()
    expect(results).toMatchSnapshot()
  })
})

describe('Normalize Project', () => {
  it('converts suite.tests guids to names', () => {
    const project = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'test-files', 'single-suite.side'))
    )
    const normalizedProject = normalizeProject(project)
    const testNames = project.tests.map(test => test.name)
    expect(testNames).toEqual(normalizedProject.suites[0].tests)
  })
})

function normalizeProject(project) {
  let _project = { ...project }
  _project.suites.forEach(suite => {
    suite.tests.forEach((testId, index) => {
      suite.tests[index] = _project.tests.find(test => test.id === testId).name
    })
  })
  return _project
}
