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

import path from 'path'
import parseModulePath from '../module-path'

const origSep = path.sep

afterAll(() => {
  path.sep = origSep
})

describe('module path parser (POSIX)', () => {
  beforeAll(() => {
    path.sep = path.posix.sep
  })
  it('should parse a single path', () => {
    const mpath = '/a/b/c/node_modules'
    expect(parseModulePath(mpath)).toEqual(['/a/b/c/node_modules'])
  })
  it('should parse a single path not at the end of the path', () => {
    const mpath = '/a/b/c/node_modules/d'
    expect(parseModulePath(mpath)).toEqual(['/a/b/c/node_modules'])
  })
  it('should parse multiple paths', () => {
    const mpath = '/a/b/c/node_modules/d/node_modules'
    expect(parseModulePath(mpath)).toEqual([
      '/a/b/c/node_modules/d/node_modules',
      '/a/b/c/node_modules',
    ])
  })
})

describe('module path parser (Windows)', () => {
  beforeAll(() => {
    path.sep = path.win32.sep
  })
  it('should\\c\\node_modules parse Windows paths', () => {
    const mpath = 'C:\\a\\b\\node_modules\\c\\node_modules'
    expect(parseModulePath(mpath)).toEqual([
      'C:\\a\\b\\node_modules\\c\\node_modules',
      'C:\\a\\b\\node_modules',
    ])
  })
})
