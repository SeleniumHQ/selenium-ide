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

import migrate from '../../../IO/migrations/implicit-locators'

describe('project migrator', () => {
  it('should be included in 1.1', () => {
    expect(migrate.version).toBe('1.1')
  })
  it('should migrate implicit locators commands', () => {
    const project = {
      tests: [
        {
          id: '1',
          commands: [
            {
              command: 'click',
              target: 'anId',
              value: '',
            },
            {
              command: 'click',
              target: '//somexpath',
              targets: [
                ['something', 'id'],
                ['id=something', 'id'],
                ["(//a[contains(text(),'number line')])[2]", 'xpath:link'],
                ["xpath=//a[contains(text(),'number density')]", 'xpath:link'],
                ["//a[contains(text(),'number density')]", 'xpath:link'],
                [
                  "//div[@id='mw-content-text']/div/p[2]/a[5]",
                  'xpath:idRelative',
                ],
                ["//a[contains(@href, '/wiki/Number_density')]", 'xpath:href'],
                ['//a[5]', 'xpath:position'],
              ],
              value: '',
            },
            {
              command: 'click',
              target: '//another=xpath',
              value: '',
            },
            {
              command: 'click',
              target: 'xpath=//ignorethis',
              value: '',
            },
            {
              command: 'click',
              target: 'linkText=ignorethis',
              value: '',
            },
            {
              command: 'click',
              target: 'id=ignorethis',
              value: '',
            },
            {
              command: 'pause',
              target: '1000',
              value: '',
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
              command: 'click',
              target: 'id=anId',
              value: '',
            },
            {
              command: 'click',
              target: 'xpath=//somexpath',
              targets: [
                ['id=something', 'id'],
                ['id=something', 'id'],
                [
                  "xpath=(//a[contains(text(),'number line')])[2]",
                  'xpath:link',
                ],
                ["xpath=//a[contains(text(),'number density')]", 'xpath:link'],
                ["xpath=//a[contains(text(),'number density')]", 'xpath:link'],
                [
                  "xpath=//div[@id='mw-content-text']/div/p[2]/a[5]",
                  'xpath:idRelative',
                ],
                [
                  "xpath=//a[contains(@href, '/wiki/Number_density')]",
                  'xpath:href',
                ],
                ['xpath=//a[5]', 'xpath:position'],
              ],
              value: '',
            },
            {
              command: 'click',
              target: 'xpath=//another=xpath',
              value: '',
            },
            {
              command: 'click',
              target: 'xpath=//ignorethis',
              value: '',
            },
            {
              command: 'click',
              target: 'linkText=ignorethis',
              value: '',
            },
            {
              command: 'click',
              target: 'id=ignorethis',
              value: '',
            },
            {
              command: 'pause',
              target: '1000',
              value: '',
            },
          ],
        },
      ],
    })
  })
})
