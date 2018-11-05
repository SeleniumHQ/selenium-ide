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

import fs from 'fs'
import path from 'path'
import { useStrict } from 'mobx'
import {
  verifyFile,
  FileTypes,
  parseSuiteRequirements,
  migrateTestCase,
  migrateProject,
  migrateUrls,
} from '../../../IO/legacy/migrate'

useStrict(true)

describe('file classifier', () => {
  it('should recognize suite', () => {
    const suite = fs
      .readFileSync(
        path.join(__dirname, 'IDE_test_4/000_clear_mandant_Suite.html')
      )
      .toString()
    expect(verifyFile(suite)).toBe(FileTypes.Suite)
  })
  it('should recognize test case', () => {
    const test = fs
      .readFileSync(path.join(__dirname, 'IDE_test.html'))
      .toString()
    expect(verifyFile(test)).toBe(FileTypes.TestCase)
  })
  it('should throw when another file is given', () => {
    expect(() => {
      verifyFile('something is wrong here')
    }).toThrowError('Unknown file was received')
  })
})

describe('selenium test case migration', () => {
  it('should migrate the set example', () => {
    const file = fs
      .readFileSync(path.join(__dirname, 'IDE_test.html'))
      .toString()
    const { test } = migrateTestCase(file)
    expect(test.commands.length).toBe(4)
    const command = test.commands[0]
    expect(command.command).toBe('open')
    expect(command.target).toBe(
      '/?gfe_rd=cr&dcr=0&ei=9vz6Way_KdPPXqjmsbgI&gws_rd=ssl'
    )
    expect(command.value).toBe('')
  })
  it('should migrate the second example', () => {
    const file = fs
      .readFileSync(path.join(__dirname, 'IDE_test_2.html'))
      .toString()
    const { test } = migrateTestCase(file)
    expect(test.commands.length).toBe(26)
  })
  it('should join line breaks to <br /> in the target field', () => {
    const file = fs
      .readFileSync(path.join(__dirname, 'IDE_test_2.html'))
      .toString()
    const { test } = migrateTestCase(file)
    expect(test.commands[8].target).toBe(
      "//a[contains(text(),'Most\\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;followers')]"
    )
  })
  it('should sanitize the input prior to converting', () => {
    const file = fs
      .readFileSync(path.join(__dirname, 'IDE_test_3.html'))
      .toString()
    const { test } = migrateTestCase(file)
    expect(test.name).toBe('Show Details')
    expect(test.commands[0].target).toBe(
      'http://unknow.url/?func=ll&objid=2838227'
    )
  })
  it('should decode the input post conversion', () => {
    const file = fs
      .readFileSync(path.join(__dirname, 'IDE_test_8.html'))
      .toString()
    const { test } = migrateTestCase(file)
    expect(test.commands[14].target).toBe(
      '//a[@onclick=\'return confirm("Wollen Sie den Datensatz wirklich löschen?")\']'
    )
  })
  it('should import a test case with a comment in it', () => {
    const file = fs
      .readFileSync(path.join(__dirname, 'IDE_test_9.html'))
      .toString()
    const { test } = migrateTestCase(file)
    expect(test.commands.length).toBe(2)
  })
  it('should import a test case with a command in it', () => {
    const file = fs
      .readFileSync(path.join(__dirname, 'IDE_test_10.html'))
      .toString()
    const { test } = migrateTestCase(file)
    expect(test.commands.length).toBe(1)
  })
  it('should remove unimplemented wait commands from the test case', () => {
    const file = fs
      .readFileSync(path.join(__dirname, 'IDE_test_wait.html'))
      .toString()
    const { test } = migrateTestCase(file)
    expect(test.commands.length).toBe(1)
    expect(test.commands[0].command).toBe('waitForElementPresent')
  })
})

describe('selenium suite migration', () => {
  it('should give a list of required test cases', () => {
    const suite = fs
      .readFileSync(
        path.join(__dirname, 'IDE_test_4/000_clear_mandant_Suite.html')
      )
      .toString()
    const required = parseSuiteRequirements(suite)
    expect(required.length).toBe(3)
    expect(required).toEqual([
      'einzeltests/MH_delete.html',
      'einzeltests/kontakte_leeren.html',
      'einzeltests/DMS_clear.html',
    ])
  })
  it('should reduct multiple same named test cases', () => {
    const suite = fs
      .readFileSync(
        path.join(__dirname, 'IDE_test_10/Suite login_multiple cases.htm')
      )
      .toString()
    const required = parseSuiteRequirements(suite)
    expect(required.length).toBe(2)
    expect(required).toEqual(['Log in as test user.htm', 'Log out from BO.htm'])
  })
  it('should migrate the suite', () => {
    const files = [
      {
        name: '000_clear_mandant_Suite.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', '000_clear_mandant_Suite.html')
          )
          .toString(),
      },
      {
        name: 'einzeltests/DMS_clear.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', 'einzeltests/DMS_clear.html')
          )
          .toString(),
      },
      {
        name: 'einzeltests/kontakte_leeren.html',
        contents: fs
          .readFileSync(
            path.join(
              __dirname,
              'IDE_test_4',
              'einzeltests/kontakte_leeren.html'
            )
          )
          .toString(),
      },
      {
        name: 'einzeltests/MH_delete.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', 'einzeltests/MH_delete.html')
          )
          .toString(),
      },
    ]
    expect(migrateProject(files).suites.length).toBe(1)
  })
  it('should fail to migrate due to missing test case', () => {
    const files = [
      {
        name: '000_clear_mandant_Suite.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', '000_clear_mandant_Suite.html')
          )
          .toString(),
      },
      {
        name: 'einzeltests/DMS_clear.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', 'einzeltests/DMS_clear.html')
          )
          .toString(),
      },
      {
        name: 'einzeltests/kontakte_leeren.html',
        contents: fs
          .readFileSync(
            path.join(
              __dirname,
              'IDE_test_4',
              'einzeltests/kontakte_leeren.html'
            )
          )
          .toString(),
      },
    ]
    expect(() => {
      migrateProject(files)
    }).toThrow(
      "The file einzeltests/MH_delete.html is missing, suite can't be migrated"
    )
  })
  it('should migrate multiple suites', () => {
    const files = [
      {
        name: '000_clear_mandant_Suite.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', '000_clear_mandant_Suite.html')
          )
          .toString(),
      },
      {
        name: '001_clear_mandant_Suite.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', '000_clear_mandant_Suite.html')
          )
          .toString(),
      },
      {
        name: 'einzeltests/DMS_clear.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', 'einzeltests/DMS_clear.html')
          )
          .toString(),
      },
      {
        name: 'einzeltests/kontakte_leeren.html',
        contents: fs
          .readFileSync(
            path.join(
              __dirname,
              'IDE_test_4',
              'einzeltests/kontakte_leeren.html'
            )
          )
          .toString(),
      },
      {
        name: 'einzeltests/MH_delete.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', 'einzeltests/MH_delete.html')
          )
          .toString(),
      },
    ]
    const project = migrateProject(files)
    expect(project.suites.length).toBe(2)
    expect(project.tests.length).toBe(3)
  })
  it('should create a suite if none was given', () => {
    const files = [
      {
        name: 'einzeltests/DMS_clear.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', 'einzeltests/DMS_clear.html')
          )
          .toString(),
      },
      {
        name: 'einzeltests/kontakte_leeren.html',
        contents: fs
          .readFileSync(
            path.join(
              __dirname,
              'IDE_test_4',
              'einzeltests/kontakte_leeren.html'
            )
          )
          .toString(),
      },
      {
        name: 'einzeltests/MH_delete.html',
        contents: fs
          .readFileSync(
            path.join(__dirname, 'IDE_test_4', 'einzeltests/MH_delete.html')
          )
          .toString(),
      },
    ]
    const project = migrateProject(files)
    expect(project.suites.length).toBe(1)
    expect(project.tests.length).toBe(3)
  })
})

describe('url migration', () => {
  it('should migrate all urls to absolute ones', () => {
    const test = {
      commands: [
        {
          command: 'open',
          target: '/index.html',
        },
        {
          command: 'open',
          target: '/users',
        },
      ],
    }
    const baseUrl = 'https://seleniumhq.org/'
    const migrated = migrateUrls(test, baseUrl)
    expect(migrated.commands[0].target).toBe(
      'https://seleniumhq.org/index.html'
    )
    expect(migrated.commands[1].target).toBe('https://seleniumhq.org/users')
  })
  it('should not migrate absolute urls', () => {
    const test = {
      commands: [
        {
          command: 'open',
          target: 'https://seleniumhq.org/index.html',
        },
      ],
    }
    const baseUrl = 'https://wikipedia.org'
    const migrated = migrateUrls(test, baseUrl)
    expect(migrated.commands[0].target).toBe(
      'https://seleniumhq.org/index.html'
    )
  })
})
