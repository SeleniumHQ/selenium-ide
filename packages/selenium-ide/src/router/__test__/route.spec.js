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

import Route from '../route'

describe('function route', () => {
  it('should test against verb', () => {
    const route = new Route('get', '/', new Function())
    expect(route.test('get', '/')).toBeTruthy()
    expect(route.test('post', '/')).toBeFalsy()
  })
  it('should match test case insesitively', () => {
    const route = new Route('get', '/', new Function())
    expect(route.test('get', '/')).toBeTruthy()
    expect(route.test('GET', '/')).toBeTruthy()
    expect(route.test('GeT', '/')).toBeTruthy()
  })
  it('should match against uri', () => {
    const route = new Route('get', '/people', new Function())
    expect(route.test('get', '/people')).toBeTruthy()
    expect(route.test('post', '/people')).toBeFalsy()
    expect(route.test('post', 'people')).toBeFalsy()
    expect(route.test('post', '/peop')).toBeFalsy()
    expect(route.test('get', '/peop')).toBeFalsy()
  })
})
