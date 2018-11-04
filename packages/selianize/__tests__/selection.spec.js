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

import SelectionEmitter from '../src/selection'

describe('selection location code emitter', () => {
  it('should fail to emit unknown selection locator', () => {
    return expect(SelectionEmitter.emit('notExists=element')).rejects.toThrow(
      'Unknown selection locator notExists'
    )
  })
  it('should assume when no selector is given that it is the label locator', () => {
    return expect(SelectionEmitter.emit('label')).resolves.toBe(
      "By.xpath(`//option[. = 'label']`)"
    )
  })
  it('should emit label locator', () => {
    const type = 'label'
    const selector = 'a label'
    return expect(SelectionEmitter.emit(`${type}=${selector}`)).resolves.toBe(
      `By.xpath(\`//option[. = '${selector}']\`)`
    )
  })
  it('should emit id locator', () => {
    const type = 'id'
    const selector = 'someId'
    return expect(SelectionEmitter.emit(`${type}=${selector}`)).resolves.toBe(
      `By.css(\`*[id="${selector}"]\`)`
    )
  })
  it('should emit value locator', () => {
    const type = 'value'
    const selector = 'someValue'
    return expect(SelectionEmitter.emit(`${type}=${selector}`)).resolves.toBe(
      `By.css(\`*[value="${selector}"]\`)`
    )
  })
  it('should emit id locator', () => {
    const type = 'index'
    const selector = '2'
    return expect(SelectionEmitter.emit(`${type}=${selector}`)).resolves.toBe(
      `By.css(\`*:nth-child(${selector})\`)`
    )
  })
})
