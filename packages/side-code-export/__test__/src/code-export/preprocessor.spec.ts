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
  preprocessParameter,
  resolveVariables,
} from '../../../src/code-export/preprocessor'

describe('preprocessors', () => {
  const variableLookup = (varName: string) => {
    return `vars.get("${varName}").toString()`
  }

  describe('default', () => {
    it('should interpolate stored variables', () => {
      const command = {
        command: 'echo',
        target: '${var}',
      }
      const target = defaultPreprocessor(command.target, variableLookup)
      return expect(resolveVariables(target, variableLookup)).toBe(
        'vars.get("var").toString()'
      )
    })
  })
  describe('resolve variables', () => {
    const python = {
      quotes: ['"', "'"],
      toString: (lookup: string) => `str(${lookup})`,
    }
    const pythonLookup = (name: string) => `self.vars["${name}"]`
    const resolve = (code: string) =>
      resolveVariables(
        code.replace(/\$\{(\w+)\}/g, (match) => defaultPreprocessor(match)),
        pythonLookup,
        python
      )
    it('should join a variable with the text around it', () => {
      expect(resolve('print("a ${x} b")')).toBe(
        'print("a " + str(self.vars["x"]) + " b")'
      )
    })
    it('should convert a variable that is the whole string', () => {
      expect(resolve('find("${x}")')).toBe('find(str(self.vars["x"]))')
    })
    it('should join several variables', () => {
      expect(resolve("find('#${x}${y}')")).toBe(
        'find(\'#\' + str(self.vars["x"]) + str(self.vars["y"]))'
      )
    })
    it('should use the lookup outside of a string', () => {
      expect(resolve('range(0, ${x})')).toBe('range(0, self.vars["x"])')
    })
    it('should keep a mark with no end as it is', () => {
      expect(resolveVariables('print("a \uE000x")', pythonLookup, python)).toBe(
        'print("a \uE000x")'
      )
    })
    it('should remove marks typed in a parameter', () => {
      const target = preprocessParameter(
        "\uE000x') + `id`\uE001",
        undefined,
        pythonLookup,
        { ignoreEscaping: false }
      )
      const code = resolveVariables(`run("${target}")`, pythonLookup, python)
      expect(code).not.toMatch(/[\uE000\uE001]/)
      expect(code).not.toContain('self.vars')
    })
    it('should skip escaped quotes', () => {
      expect(resolve('find("//*[@id=\\"${x}\\"]")')).toBe(
        'find("//*[@id=\\"" + str(self.vars["x"]) + "\\"]")'
      )
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
      const keys = await keysPreprocessor(command.value, variableLookup)
      return expect(
        keys.map((key) => resolveVariables(key, variableLookup))
      ).toEqual(['test', 'vars.get("var").toString()', 'foo', `Key['ENTER']`])
    })
  })
})
