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
  interpolateScript,
  xlateArgument,
} from '../../../IO/SideeX/formatCommand'
import Variables from '../../../stores/view/Variables'

let variables
beforeEach(() => {
  variables = new Variables()
})

describe('interpolate string', () => {
  it('should interpolate false values', () => {
    variables.set('a', undefined)
    expect(xlateArgument('${a}', variables)).toBe('undefined')
    variables.set('a', null)
    expect(xlateArgument('${a}', variables)).toBe('null')
    variables.set('a', false)
    expect(xlateArgument('${a}', variables)).toBe('false')
    variables.set('a', 0)
    expect(xlateArgument('${a}', variables)).toBe('0')
    variables.set('a', '')
    expect(xlateArgument('${a}', variables)).toBe('')
  })
})

describe('interpolate script', () => {
  it('should not interpolate a script without variables', () => {
    const script = 'return 1'
    expect(interpolateScript(script, variables).script).toEqual(script)
  })
  it('should interpolate a script with a single argument', () => {
    variables.set('a', 1)
    const script = 'return ${a}'
    const r = interpolateScript(script, variables)
    expect(r.script).toEqual('return arguments[0]')
    expect(r.argv[0]).toBe(1)
  })
  it('should interpolate a script with multiple arguments', () => {
    variables.set('a', 1)
    variables.set('b', false)
    const script = 'return ${a} + ${a} || ${b}'
    const r = interpolateScript(script, variables)
    expect(r.script).toEqual(
      'return arguments[0] + arguments[0] || arguments[1]'
    )
    expect(r.argv[0]).toBe(1)
    expect(r.argv[1]).toBe(false)
  })
})
