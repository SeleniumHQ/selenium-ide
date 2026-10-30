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

import { numberLoops } from '../../../src/code-export/emit'
import { loopLimit } from '../../../src/code-export/parsers'

const commands = (...names: string[]) =>
  names.map((command) => ({ id: command, command, target: '', value: '' }))

describe('numberLoops', () => {
  it('should number each loop in order', () => {
    expect(
      numberLoops(commands('while', 'end', 'times', 'end', 'open'))
    ).toEqual([1, undefined, 2])
  })
  it('should give repeatIf the number of its do', () => {
    expect(
      numberLoops(commands('do', 'while', 'end', 'repeatIf', 'do', 'repeatIf'))
    ).toEqual([1, 2, undefined, 1, 3, 3])
  })
})

describe('loopLimit', () => {
  it('should use the value when it is a number', () => {
    expect(loopLimit('5')).toBe('5')
    expect(loopLimit('2.5')).toBe('2')
  })
  it('should keep the limit between 0 and the largest 32-bit integer', () => {
    expect(loopLimit('Infinity')).toBe('2147483647')
    expect(loopLimit('1e309')).toBe('2147483647')
    expect(loopLimit('-Infinity')).toBe('0')
    expect(loopLimit('-5')).toBe('0')
  })
  it('should be 1000 when the value is empty or not a number', () => {
    expect(loopLimit('')).toBe('1000')
    expect(loopLimit(undefined)).toBe('1000')
    expect(loopLimit('x')).toBe('1000')
  })
})
