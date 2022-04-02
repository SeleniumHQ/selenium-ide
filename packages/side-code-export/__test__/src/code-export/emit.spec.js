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
  emitCommand,
  emitLocation,
  emitSelection,
  emitOriginTracing,
} from '../../../src/code-export/emit'
import TestCase from '../../../../selenium-ide/src/neo/models/TestCase'
import Command from '../../../../selenium-ide/src/neo/models/Command'

describe('Command emitter', () => {
  describe('validation', () => {
    it('invalid command', () => {
      let command = new Command(undefined, 'chec')
      return expect(() => {
        emitCommand(command)
      }).toThrow("Invalid command 'chec'")
    })
    it('missing target param', () => {
      let command = new Command(undefined, 'check')
      return expect(() => {
        emitCommand(command)
      }).toThrow("Incomplete command 'check'. Missing expected target argument")
    })
    it('missing value param', () => {
      let command = new Command(undefined, 'assertNotSelectedValue', 'blah')
      return expect(() => {
        emitCommand(command)
      }).toThrow(
        "Incomplete command 'assertNotSelectedValue'. Missing expected value argument"
      )
    })
    it('optional param not provided', async () => {
      let command = new Command(undefined, 'times', 10)
      await expect(emitCommand(command)).resolves
      command = new Command(undefined, 'while', true)
      await expect(emitCommand(command)).resolves
      command = new Command(undefined, 'executeScript', 'return "blah"')
      return expect(emitCommand(command)).resolves
    })
    it("single param commands don't trigger validation", () => {
      let command = new Command(undefined, 'assertAlert', 'asdf')
      return expect(() => {
        emitCommand(command)
      }).not.toThrow()
    })
    it('ignores disabled commands', async () => {
      let command = new Command(undefined, '//assertAlert', 'asdf')
      await expect(() => {
        emitCommand(command)
      }).not.toThrow()
      command = new Command(undefined, '//blah')
      await expect(() => {
        emitCommand(command)
      }).not.toThrow()
    })
  })
})

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
    expect(emitOriginTracing(test, { commentPrefix: '//' }, true, false)).toEqual([
      '// Test name: Untitled Test',
      '// Step # | name | target | value | comment',
      '// 1 | a | foo | bar | ',
      '// 2 | b | baz | qux | a comment',
    ])
    expect(emitOriginTracing(test, { commentPrefix: '//' }, true, true)).toEqual([
      '// Test name: Untitled Test',
      '// Step # | name | target | value',
      '// 1 | a | foo | bar',
      '// 2 | b | baz | qux\n// a comment',
    ])
    expect(emitOriginTracing(test, { commentPrefix: '//' }, false, true)).toEqual([
      '',
      '// a comment',
    ])
    expect(emitOriginTracing(test, { commentPrefix: '//' }, false, false)).toEqual([
      '',
      '',
    ])
  })
})
