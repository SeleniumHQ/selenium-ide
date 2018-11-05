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

import Satisfies from '../versioner'

describe('semantic versioner', () => {
  it('should return `undefined` for exact version match', () => {
    expect(Satisfies('2.1', '2.1')).toBeUndefined()
  })
  it('should return a runner upgrade warning for upper minor version mismatch', () => {
    expect(Satisfies('2.1', '2.0')).toEqual(
      'runner is older than project file, in case of issues upgrade the runner using: `npm i -g selenium-side-runner@latest`'
    )
  })
  it('should return an IDE upgrade warning for lower minor version mismatch', () => {
    expect(Satisfies('2.1', '2.2')).toEqual(
      'project file is older than recommended, in case of issues upgrade the project via the IDE'
    )
  })
  it('should throw a runner upgrade error for upper major version mismatch', () => {
    expect(() => Satisfies('2.1', '1.1')).toThrow(
      'runner is too old to run the project file, upgrade the runner using: `npm i -g selenium-side-runner@latest`'
    )
  })
  it('should throw an IDE upgrade error for lower major version mismatch', () => {
    expect(() => Satisfies('2.1', '3.1')).toThrow(
      'project file is too old for the runner, upgrade the project via the IDE'
    )
  })
})
