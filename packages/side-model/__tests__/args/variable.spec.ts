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

import variable from '../../src/args/variable'

describe('variable schema', () => {
  describe('verify', () => {
    it('should verify a valid variable name', () => {
      expect(variable.validate('tomer')).toBeTruthy()
      expect(variable.validate('tomer2')).toBeTruthy()
      expect(variable.validate('tomer_steinfeld')).toBeTruthy()
    })

    it('should throw for a variable with an invalid character', () => {
      expect(() => variable.validate('aå')).toThrow('Unexpected token å')
    })

    it('should throw for variable starting with a number', () => {
      expect(() => variable.validate('5a')).toThrow('Unexpected token 5')
    })

    describe('property access', () => {
      it('should allow to access a property', () => {
        expect(variable.validate('tomer.steinfeld')).toBeTruthy()
      })

      it('should throw when trying to access an un-declared property', () => {
        expect(() => variable.validate('tomer..steinfeld')).toThrow(
          'Unexpected token .'
        )
      })

      it('should throw for a variable with an invalid property', () => {
        expect(() => variable.validate('tomer.aå')).toThrow(
          'Unexpected token å'
        )
      })

      it('should throw for variable property starting with a number', () => {
        expect(() => variable.validate('tomer.5a')).toThrow(
          'Unexpected token 5'
        )
      })
    })

    describe('array access', () => {
      it('should allow access to an array by index', () => {
        expect(variable.validate('tomer[0]')).toBeTruthy()
        expect(variable.validate('tomer[10]')).toBeTruthy()
        expect(variable.validate('tomer[1318237]')).toBeTruthy()
      })
      it('should allow access to nested variables by index', () => {
        expect(variable.validate('tomer[1][2]')).toBeTruthy()
      })
      it('should fail to access an array with an invalid integer index', () => {
        expect(() => variable.validate('tomer[00]')).toThrow(
          'Unexpected token 0'
        )
      })
      it('should not allow two opening brackets', () => {
        expect(() => variable.validate('tomer[[1]')).toThrow(
          'Unexpected token ['
        )
      })
      it('should not allow an opening bracket without a closing one', () => {
        expect(() => variable.validate('tomer[1')).toThrow('Missing token ]')
      })
      it('should not allow two closing tags', () => {
        expect(() => variable.validate('tomer]]')).toThrow('Unexpected token ]')
      })
      it('should not allow empty accessing array with no index', () => {
        expect(() => variable.validate('tomer[]')).toThrow('Unexpected token ]')
      })
      it('should not allow [.] syntax', () => {
        expect(() => variable.validate('tomer[.]')).toThrow(
          'Unexpected token .'
        )
      })
      it('should allow accessing array via variable index', () => {
        expect(variable.validate('tomer[steinfeld]')).toBeTruthy()
      })
    })
  })
})
