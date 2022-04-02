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

import { emit } from '../../src/selection'

describe('selection location code emitter', () => {
  it('should fail to emit unknown selection locator', () => {
    return expect(() => {
      emit('notExists=element')
    }).toThrow('Unknown selection locator notExists')
  })
  it('should assume when no selector is given that it is the label locator', () => {
    return expect(emit('label')).resolves.toBe(
      `By.XPath("//option[. = 'label']")`
    )
  })
  it('should emit label locator', () => {
    const type = 'label'
    const selector = 'a label'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.XPath("//option[. = '${selector}']")`
    )
  })
  it('should emit id locator', () => {
    const type = 'id'
    const selector = 'someId'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.CssSelector("*[id='${selector}']")`
    )
  })
  it('should emit value locator', () => {
    const type = 'value'
    const selector = 'someValue'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.CssSelector("*[value='${selector}']")`
    )
  })
  it('should emit index locator', () => {
    const type = 'index'
    const selector = '2'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.CssSelector("*:nth-child(${selector})")`
    )
  })
})
