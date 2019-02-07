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

import { absolutifyUrl } from '../../../IO/playback/utils'

describe('url absolutifier', () => {
  it('should append to the base url', () => {
    expect(absolutifyUrl('/test.html', 'https://localhost')).toBe(
      'https://localhost/test.html'
    )
  })
  it('should replace the path', () => {
    expect(absolutifyUrl('/test.html', 'http://localhost/a/b')).toBe(
      'http://localhost/test.html'
    )
  })
  it('should append to the path', () => {
    expect(absolutifyUrl('test.html', 'http://localhost/a/b/')).toBe(
      'http://localhost/a/b/test.html'
    )
  })
  it('should resolve from the path', () => {
    expect(absolutifyUrl('../test.html', 'http://localhost/a/b/')).toBe(
      'http://localhost/a/test.html'
    )
  })
  it('should resolve from file ending path', () => {
    expect(absolutifyUrl('test.html', 'http://localhost/a/b.html')).toBe(
      'http://localhost/a/test.html'
    )
  })
  it('should replace the base url with an absolute url', () => {
    expect(
      absolutifyUrl('http://absolute/test.html', 'http://localhost/test.html')
    ).toBe('http://absolute/test.html')
  })
})
