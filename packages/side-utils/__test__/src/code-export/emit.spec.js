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

import {
  emitLocation,
  emitSelection,
  emitOriginTracing,
} from '../../../src/code-export/emit'
import TestCase from '../../../../selenium-ide/src/neo/models/TestCase'

describe('Location emitter', () => {
  it('emits by sync emitter', () => {
    const emitters = {
      id: selector => {
        return `By.id("${selector}")`
      },
    }
    expect(emitLocation('id=blah', emitters)).toEqual(`By.id("blah")`)
  })
  it('emits by async emitter', () => {
    const emitters = {
      id: selector => {
        return Promise.resolve(`By.id("${selector}")`)
      },
    }
    expect(emitLocation('id=blah', emitters)).resolves.toBe(`By.id("blah")`)
  })
  it('should fail to emit empty string', () => {
    return expect(() => emitLocation('', {})).toThrow("Locator can't be empty")
  })
  it('should fail to emit unknown locator', () => {
    return expect(() => emitLocation('notExists=element', {})).toThrow(
      'Unknown locator notExists'
    )
  })
})

describe('Selection emitter', () => {
  it('emits by sync emitter', () => {
    const emitters = {
      id: id => {
        return `By.css(\`*[id="${id}"]\`)`
      },
    }
    expect(emitSelection('id=blah', emitters)).toEqual(
      `By.css(\`*[id="blah"]\`)`
    )
  })
  it('emits by async emitter', () => {
    const emitters = {
      id: id => {
        return Promise.resolve(`By.css(\`*[id="${id}"]\`)`)
      },
    }
    expect(emitSelection('id=blah', emitters)).resolves.toBe(
      `By.css(\`*[id="blah"]\`)`
    )
  })
  it('should fail to emit empty string', () => {
    return expect(() => emitSelection('', {})).toThrow(
      "Location can't be empty"
    )
  })
  it('should fail to emit unknown locator', () => {
    return expect(() => emitSelection('notExists=element', {})).toThrow(
      'Unknown selection locator notExists'
    )
  })
})

describe('Trace emitter', () => {
  it('should emit original test step number and details', () => {
    const test = new TestCase()
    test.createCommand(undefined, 'a', 'foo', 'bar')
    test.createCommand(undefined, 'b', 'baz', 'qux', 'a comment')
    expect(emitOriginTracing(test, { commentPrefix: '//' })).toEqual([
      '// Test name: Untitled Test',
      '// Step # | name | target | value | comment',
      '// 1 | a | foo | bar | ',
      '// 2 | b | baz | qux | a comment',
    ])
  })
})
