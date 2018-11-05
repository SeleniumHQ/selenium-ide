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

import { useStrict } from 'mobx'
import Variables from '../../../stores/view/Variables'

useStrict(true)

afterEach(() => {
  Variables.clear()
})

describe('Variables', () => {
  it('should clear the map', () => {
    const key = 'key1'
    const value = 'value1'
    Variables.set(key, value)
    expect(Variables.storedVars.size).toBe(1)
    Variables.clear()
    expect(Variables.storedVars.size).toBe(0)
  })
  it('should add new key and value to the map', () => {
    const key = 'key1'
    const value = 'value1'
    Variables.set(key, value)
    expect(Variables.storedVars.size).toBe(1)
  })
  it('should not add duplicates to the map', () => {
    const key = 'key1'
    const value = 'value1'
    const value2 = 'value2'
    Variables.set(key, value)
    Variables.set(key, value2)
    expect(Variables.storedVars.size).toBe(1)
  })
  it('should get the value correctly from the map', () => {
    const key1 = 'key1'
    const value1 = 'value1'
    const key2 = 'key2'
    const value2 = 'value2'
    Variables.set(key1, value1)
    Variables.set(key2, value2)
    expect(Variables.get(key1)).toBe(value1)
  })
  it('should delete the key and the value from the map', () => {
    const key = 'key1'
    const value = 'value1'
    Variables.set(key, value)
    expect(Variables.storedVars.size).toBe(1)
    Variables.delete(key)
    expect(Variables.storedVars.size).toBe(0)
  })
})
