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

import ArgType from '../../src/args/arg-type'
import Argument from '../../src/args/argument'

describe('ArgType', () => {
  describe('exact', () => {
    it('should extend an argument', () => {
      const argInput = new Argument({
        name: 'num',
        description: 'desc',
        identify: (n: number) => typeof n === 'number',
        validate: (n: number) => n === 1,
      })
      const at = ArgType.exact(argInput)

      expect(at.validate(2)).toBeFalsy()
      expect(at.validate(1)).toBeTruthy()
    })
  })

  it('should allow undefined for optional arg-types', () => {
    const argInput = new Argument({
      name: 'num',
      description: 'desc',
      identify: (n: number) => typeof n === 'number',
      validate: (n: number) => n === 1,
    })
    const at = ArgType.exact(argInput)

    expect(at.validate(undefined)).toBeTruthy()
  })

  it('should not allow undefined for optional arg-types', () => {
    const argInput = new Argument({
      name: 'num',
      description: 'desc',
      identify: (n: number) => typeof n === 'number',
      validate: (n: number) => n === 1,
    })
    const at = ArgType.exact(argInput).isRequired()

    expect(() => at.validate(undefined)).toThrow('Argument is required')
  })

  describe('oneOf', () => {
    it('should identify the argument', () => {
      const numArg = new Argument({
        name: 'num',
        description: 'desc',
        identify: (n: number) => typeof n === 'number',
        validate: (n: number) => n === 1,
      })
      const strArg = new Argument({
        name: 'str',
        description: 'desc',
        identify: (s: string) => typeof s === 'string',
        validate: (s: string) => s === 'str',
      })

      const at = ArgType.oneOf([numArg, strArg])
      expect.assertions(3)
      expect(at.identify(1)).toBe(numArg)
      expect(at.identify('1')).toBe(strArg)

      const arg = at.identify(1)
      if (numArg.is(arg)) {
        expect(arg.validate(1)).toBeTruthy()
      }
    })

    it('should validate the arguments', () => {
      const numArg = new Argument({
        name: 'num',
        description: 'desc',
        identify: (n: number) => typeof n === 'number',
        validate: (n: number) => n === 1,
      })
      const strArg = new Argument({
        name: 'str',
        description: 'desc',
        identify: (s: string) => typeof s === 'string',
        validate: (s: string) => s === 'str',
      })

      const at = ArgType.oneOf([numArg, strArg])
      expect(at.validate(1)).toBeTruthy()
      expect(at.validate(2)).toBeFalsy()
      expect(at.validate('str')).toBeTruthy()
      expect(at.validate('tomer')).toBeFalsy()
    })

    it('should work with extending', () => {
      const numArg = new Argument({
        name: 'num',
        description: 'desc',
        identify: (n: number) => typeof n === 'number',
        validate: (n: number) => n === 1,
      })
      const numArg2 = new Argument({
        name: 'num',
        description: 'desc',
        identify: (n: number) => typeof n === 'number',
        validate: (n: number) => n === 1,
        extending: numArg,
      })
      const numArg3 = new Argument({
        name: 'num',
        description: 'desc',
        identify: (n: number) => typeof n === 'number',
        validate: (n: number) => n === 1,
        extending: numArg2,
      })
      const strArg = new Argument({
        name: 'str',
        description: 'desc',
        identify: (s: string) => typeof s === 'string',
        validate: (s: string) => s === 'str',
      })

      const at = ArgType.oneOf([numArg3, strArg])
      expect.assertions(4)
      expect(at.identify(1)).toBe(numArg3)
      expect(at.identify('1')).toBe(strArg)

      const arg = at.identify(1)
      if (numArg3.is(arg)) {
        expect(arg.validate(1)).toBeTruthy()
        expect(arg.extensionOf(numArg)).toBeTruthy()
      }
    })
  })
})
