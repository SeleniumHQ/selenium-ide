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

import migrate from '../../src/migrations/store-element-count'

describe('project migrator', () => {
  it('should be included in 3.0', () => {
    expect(migrate.version).toBe('3.0')
  })
  it('should migrate `store xpath count` commands', () => {
    const project = {
      tests: [
        {
          id: '1',
          commands: [
            {
              command: 'storeXpathCount',
              target: 'xpath=//table',
              value: 'var',
            },
            {
              command: 'storeXpathCount',
              target: '//table',
              value: 'var',
            },
          ],
        },
      ],
    }
    const upgraded = migrate(project)
    expect(upgraded).toEqual({
      tests: [
        {
          id: '1',
          commands: [
            {
              command: 'storeElementCount',
              target: 'xpath=//table',
              value: 'var',
            },
            {
              command: 'storeElementCount',
              target: 'xpath=//table',
              value: 'var',
            },
          ],
        },
      ],
    })
  })
})
