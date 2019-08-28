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

import Variable from '../../src/args/variable'

describe('variable schema', () => {
  describe('verify', () => {
    it('should verify a valid variable name', () => {
      expect(Variable.verify('tomer')).toBeTruthy()
      expect(Variable.verify('tomer2')).toBeTruthy()
      expect(Variable.verify('tomer_steinfeld')).toBeTruthy()
    })

    it('should throw for a variable with an invalid character', () => {
      expect(() => Variable.verify('aå')).toThrow('Unexpected token å')
    })

    it('should throw for variable starting with a number', () => {
      expect(() => Variable.verify('5a')).toThrow('Unexpected token 5')
    })

    describe('property access', () => {
      it('should allow to access a property', () => {
        expect(Variable.verify('tomer.steinfeld')).toBeTruthy()
      })

      it('should throw when trying to access an un-declared property', () => {
        expect(() => Variable.verify('tomer..steinfeld')).toThrow(
          'Invalid empty identifier'
        )
      })

      it('should throw for a variable with an invalid property', () => {
        expect(() => Variable.verify('tomer.aå')).toThrow('Unexpected token å')
      })

      it('should throw for variable property starting with a number', () => {
        expect(() => Variable.verify('tomer.5a')).toThrow('Unexpected token 5')
      })
    })
  })
})
