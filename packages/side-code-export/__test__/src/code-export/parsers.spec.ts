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
  sanitizeName,
  capitalize,
  uniqueNames,
} from '../../../src/code-export/parsers'

describe('parsers', () => {
  it('should sanitize the name', () => {
    expect(sanitizeName('blah blah')).toEqual('blahblah')
  })
  it('should trim whitespace from the name', () => {
    expect(sanitizeName(' blah blah ')).toEqual('blahblah')
  })
  it('should prefix a name that starts with a digit', () => {
    expect(sanitizeName('2A - Suite 1')).toEqual('_2ASuite1')
  })
  it('should capitalize the name', () => {
    expect(capitalize('blahblah')).toEqual('Blahblah')
  })
  it('should number names that turn into the same code', () => {
    const toCode = (name: string) => sanitizeName(name).toLowerCase()
    expect(
      uniqueNames(['foo', 'Foo', 'foo', 'Log in', 'log-in', 'bar'], toCode)
    ).toEqual(['foo', 'Foo 2', 'foo 3', 'Log in', 'log-in 2', 'bar'])
  })
  it('should skip a number that is already taken', () => {
    expect(uniqueNames(['a', 'a 2', 'a'], sanitizeName)).toEqual([
      'a',
      'a 2',
      'a 3',
    ])
  })
  it('should ignore case only when asked', () => {
    expect(uniqueNames(['A', 'a'], (name) => name)).toEqual(['A', 'a'])
    expect(uniqueNames(['A', 'a'], (name) => name, true)).toEqual(['A', 'a 2'])
  })
})
