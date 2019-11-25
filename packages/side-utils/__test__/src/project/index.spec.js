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
import {
  normalizeTestsInSuite,
  sanitizeProjectName,
} from '../../../src/project'

describe('Normalize Project', () => {
  it('converts suite.tests guids to names', () => {
    const project = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', '..', 'test-files', 'single-suite.side')
      )
    )
    const normalizedSuite = normalizeTestsInSuite({
      suite: project.suites[0],
      tests: project.tests,
    })
    const testNames = project.tests.map(test => test.name)
    expect(testNames).toEqual(normalizedSuite.tests)
  })
  describe('save', () => {
    describe('filename', () => {
      it('allows alpha-numeric characters', () => {
        const input = 'asdf1234'
        expect(sanitizeProjectName(input)).toEqual(input)
      })
      it('allows limited special characters', () => {
        let input = 'asdf-1234'
        expect(sanitizeProjectName(input)).toEqual(input)
        input = 'asdf_1234'
        expect(sanitizeProjectName(input)).toEqual(input)
        input = 'asdf.1234'
        expect(sanitizeProjectName(input)).toEqual(input)
        input = 'asdf 1234'
        expect(sanitizeProjectName(input)).toEqual(input)
      })
      it('ignores illegal filesystem characters', () => {
        const input = 'blah:/blah'
        expect(sanitizeProjectName(input)).toEqual('blahblah')
      })
      it('with URI returns the root', () => {
        const input = 'http://a.b.com'
        expect(sanitizeProjectName(input)).toEqual('a.b.com')
      })
    })
  })
})
