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

import Argument from '../../src/args/argument'

describe('argument schema', () => {
  it('should be able to create an argument', () => {
    expect(new Argument('arg', 'desc', () => false)).toBeDefined()
  })

  it('should have a name and description', () => {
    const arg = new Argument('arg', 'desc', () => false)
    expect(arg.name).toBe('arg')
    expect(arg.description).toBe('desc')
  })

  it('should have a verify function', () => {
    const arg = new Argument<number>(
      'arg',
      'desc',
      (value: number) => value === 1
    )

    expect(arg.verify(1)).toBeTruthy()
    expect(arg.verify(2)).toBeFalsy()
  })

  describe('extentionOf', () => {
    it('should not extend anything by default', () => {
      const arg = new Argument('arg', 'desc', () => false)

      expect(arg.extending).toBeUndefined()
    })

    it('should not extend a different argument', () => {
      const arg = new Argument('arg', 'desc', () => false)
      const arg2 = new Argument('arg', 'desc', () => false)

      expect(arg2.extentionOf(arg)).toBeFalsy()
    })

    it('should extend an argument', () => {
      const arg = new Argument('arg', 'desc', () => false)
      const arg2 = new Argument('arg', 'desc', () => false, arg)

      expect(arg2.extentionOf(arg)).toBeTruthy()
    })

    it('should extend an extended argument', () => {
      const arg = new Argument('arg', 'desc', () => false)
      const arg2 = new Argument('arg', 'desc', () => false, arg)
      const arg3 = new Argument('arg', 'desc', () => false, arg2)

      expect(arg3.extentionOf(arg)).toBeTruthy()
    })
  })
})
