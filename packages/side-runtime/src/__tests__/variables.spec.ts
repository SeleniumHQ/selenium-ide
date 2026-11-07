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

import Variables from '../variables'
import { interpolateString, interpolateScript } from '../preprocessors'

describe('variables', () => {
  let variables: Variables
  beforeEach(() => {
    variables = new Variables()
    variables.set('user', { name: 'Ada', items: [1, 2, { id: 'x' }] })
  })

  it('reads nested values with . and []', () => {
    expect(variables.get('user.name')).toBe('Ada')
    expect(variables.get('user.items.0')).toBe(1)
    expect(variables.get('user.items[1]')).toBe(2)
    expect(variables.get('user.items[2].id')).toBe('x')
    expect(variables.has('user.items[2].id')).toBe(true)
  })

  it('reads a variable with the exact name first', () => {
    variables.set('user.name', 'Grace')
    expect(variables.get('user.name')).toBe('Grace')
  })

  it('keeps names with . or [ when they are set', () => {
    variables.set('my.var', 1)
    variables.set('list[0]', 2)
    expect(variables.get('my.var')).toBe(1)
    expect(variables.get('list[0]')).toBe(2)
    expect(variables.has('my')).toBe(false)
  })

  it('returns undefined when a part is missing', () => {
    expect(variables.has('user.age')).toBe(false)
    expect(variables.get('user.age.years')).toBeUndefined()
    expect(variables.has('nobody.name')).toBe(false)
    expect(variables.has('user.name.x')).toBe(false)
    variables.set('empty', null)
    expect(variables.has('empty.x')).toBe(false)
  })

  it('reads only own properties', () => {
    expect(variables.has('user.constructor')).toBe(false)
    expect(variables.has('user.__proto__')).toBe(false)
    expect(variables.has('user.items.map')).toBe(false)
    expect(variables.get('user.items.length')).toBe(3)
  })

  it('interpolates nested values in strings and scripts', () => {
    expect(interpolateString('Hi ${user.name}!', variables)).toBe('Hi Ada!')
    expect(interpolateString('${user.age}', variables)).toBe('${user.age}')
    expect(interpolateScript('return ${user.items[1]} + 1', variables)).toEqual(
      { script: 'return arguments[0] + 1', argv: [2] }
    )
  })
})
