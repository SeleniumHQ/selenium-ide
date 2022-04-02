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

import { sanitizeFileName } from '../util'

describe('filename sanitization', () => {
  it('allows alpha-numeric characters', () => {
    const input = 'asdf1234'
    expect(sanitizeFileName(input)).toEqual(input)
  })
  it('allows limited special characters', () => {
    let input = 'asdf-1234'
    expect(sanitizeFileName(input)).toEqual(input)
    input = 'asdf_1234'
    expect(sanitizeFileName(input)).toEqual(input)
    input = 'asdf.1234'
    expect(sanitizeFileName(input)).toEqual(input)
  })
  it('ignores illegal filesystem characters', () => {
    const input = 'blah:/blah'
    expect(sanitizeFileName(input)).toEqual('blahblah')
  })
  it('ignores illegal npm characters', () => {
    const input = 'hello world'
    expect(sanitizeFileName(input)).toEqual('helloworld')
  })
  it('disallows special characters in the beginning', () => {
    let input = '-hello world'
    expect(sanitizeFileName(input)).toEqual('helloworld')
    input = '.hello world'
    expect(sanitizeFileName(input)).toEqual('helloworld')
    input = '_hello world'
    expect(sanitizeFileName(input)).toEqual('helloworld')
  })
})
