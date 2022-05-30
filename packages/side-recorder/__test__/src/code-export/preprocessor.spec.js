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
  defaultPreprocessor,
  scriptPreprocessor,
  keysPreprocessor,
} from '../../../src/code-export/preprocessor'

describe('preprocessors', () => {
  const variableLookup = varName => {
    return `vars.get("${varName}").toString()`
  }

  describe('default', () => {
    it('should interpolate stored variables', () => {
      const command = {
        command: 'echo',
        target: '${var}',
      }
      return expect(
        defaultPreprocessor(command.target, variableLookup)
      ).toMatch('vars.get("var").toString()')
    })
  })
  describe('script', () => {
    it('should not affect hardcoded strings', async () => {
      const command = {
        command: 'executeScript',
        target: 'return {}',
        value: '',
      }
      return expect(await scriptPreprocessor(command.target).script).toMatch(
        `return {}`
      )
    })
    it('should pass a single argument', async () => {
      const command = {
        command: 'executeScript',
        target: 'return ${x}',
        value: '',
      }
      return expect(await scriptPreprocessor(command.target).script).toMatch(
        `return arguments[0]`
      )
    })
    it('should pass multiple arguments', async () => {
      const command = {
        command: 'executeScript',
        target: 'return ${x} + ${y} + ${x}',
        value: '',
      }
      return expect(await scriptPreprocessor(command.target).script).toMatch(
        `return arguments[0] + arguments[1] + arguments[0]`
      )
    })
  })
  describe('keys', () => {
    it('should not affect hardcoded strings', async () => {
      const command = {
        command: 'sendKeys',
        target: 'id=t',
        value: 'test',
      }
      return expect(await keysPreprocessor(command.value)[0]).toMatch(`test`)
    })
    it('should convert a single key', async () => {
      const command = {
        command: 'sendKeys',
        target: 'id=t',
        value: '${KEY_ENTER}',
      }
      return expect(await keysPreprocessor(command.value)[0]).toMatch(
        `Key['ENTER']`
      )
    })
    it('should convert a string and a key', async () => {
      const command = {
        command: 'sendKeys',
        target: 'id=t',
        value: 'test${KEY_ENTER}',
      }
      return expect(await keysPreprocessor(command.value)).toEqual([
        'test',
        `Key['ENTER']`,
      ])
    })
    it('should convert multiple strings and keys', async () => {
      const command = {
        command: 'sendKeys',
        target: 'id=t',
        value: 'test${KEY_ENTER}foo${KEY_DOWN}bar',
      }
      return expect(await keysPreprocessor(command.value)).toEqual([
        'test',
        `Key['ENTER']`,
        'foo',
        `Key['DOWN']`,
        'bar',
      ])
    })
    it('should convert keys and interpolate vars', async () => {
      const command = {
        command: 'sendKeys',
        target: 'id=t',
        value: 'test${var}foo${KEY_ENTER}',
      }
      return expect(
        await keysPreprocessor(command.value, variableLookup)
      ).toEqual(['test', 'vars.get("var").toString()', 'foo', `Key['ENTER']`])
    })
  })
})
