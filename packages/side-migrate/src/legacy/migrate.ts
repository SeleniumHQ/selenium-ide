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

import convert from 'xml-js'
import xmlescape from 'xml-escape'
import xmlunescape from 'unescape'
import {
  Commands,
  ProjectShape,
  SuiteShape,
  TestShape,
} from '@seleniumhq/side-model'

export const FileTypes = {
  Suite: 'suite',
  TestCase: 'testcase',
}

function isSuite(file: string) {
  return file.includes('table id="suiteTable"')
}

function isTestCase(file: string) {
  return file.includes('http://selenium-ide.openqa.org/profiles/test-case')
}

export function verifyFile(file: string) {
  if (isSuite(file)) {
    return FileTypes.Suite
  } else if (isTestCase(file)) {
    return FileTypes.TestCase
  } else {
    throw new Error('Unknown file was received')
  }
}

export function parseSuiteRequirements(suite: string) {
  const regex = /<a href="(.*)">/g
  let lastResult = regex.exec(suite)
  const results: Record<string, boolean> = {}
  while (lastResult) {
    results[lastResult[1]] = true
    lastResult = regex.exec(suite)
  }

  return Object.keys(results)
}

type FileObj = { name: string; contents: string }
export function migrateProject(files: FileObj[]) {
  const fileMap: Record<string, string> = {}
  files.forEach(({ name, contents }) => {
    fileMap[name] = contents
  })
  const project: ProjectShape = {
    id: 'xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx',
    name: 'Migrated Project',
    plugins: [],
    snapshot: {
      dependencies: {},
      jest: { extraGlobals: [] },
      tests: [],
    },
    suites: [],
    tests: [],
    url: '',
    urls: [],
    version: '3.0',
  }
  const suites: string[] = []
  const tests: string[] = []
  Object.keys(fileMap).forEach((fileName) => {
    if (isSuite(fileMap[fileName])) {
      suites.push(fileName)
    } else if (isTestCase(fileMap[fileName])) {
      tests.push(fileName)
    }
  })
  tests.forEach((testCaseName) => {
    const { test, baseUrl } = migrateTestCase(fileMap[testCaseName])
    test.id = testCaseName
    project.tests.push(test as TestShape)
    project.urls = [...project.urls, baseUrl]
  })
  suites.forEach((suite) => {
    migrateSuite(suite, fileMap, project)
  })
  if (!suites.length) {
    project.suites.push({
      id: 'xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx',
      name: 'Imported suite',
      parallel: false,
      persistSession: true,
      timeout: 30,
      tests,
    })
    project.name = 'Imported project'
  }
  return project
}

function migrateSuite(
  suite: string,
  fileMap: Record<string, string>,
  project: ProjectShape
) {
  const result = JSON.parse(convert.xml2json(fileMap[suite], { compact: true }))
  const parsedSuite: SuiteShape = {
    id: suite,
    name: result.html.head.title._text,
    persistSession: false,
    parallel: false,
    tests: [],
    timeout: 30,
  }
  project.suites.push(parsedSuite)
  result.html.body.table.tbody.tr.forEach((testCase: any) => {
    if (testCase.td.a) {
      const testCaseName = testCase.td.a._attributes.href
      if (!fileMap[testCaseName]) {
        throw new Error(
          `The file ${testCaseName} is missing, suite can't be migrated`
        )
      }
      parsedSuite.tests.push(testCaseName)
      project.name = parsedSuite.name
    }
  })
}

export function migrateTestCase(data: string): {
  test: Partial<TestShape>
  baseUrl: string
} {
  const sanitized = sanitizeXml(data)
  const result = JSON.parse(convert.xml2json(sanitized, { compact: true }))
  const baseUrl = result.html.head.link
    ? result.html.head.link._attributes.href
    : undefined
  let tr = result.html.body.table.tbody.tr
  tr = Array.isArray(tr) ? tr : [tr]
  const test = {
    name: result.html.body.table.thead.tr.td._text,
    commands: tr
      .filter(
        (row: any) => row.td[0]._text && isImplementedWait(row.td[0]._text)
      )
      .map((row: any) => ({
        command: row.td[0]._text && row.td[0]._text.replace('AndWait', ''),
        target: xmlunescape(parseTarget(row.td[1])),
        value: xmlunescape(row.td[2]._text || ''),
        comment: '',
      })),
  }

  return { test, baseUrl }
}

export function migrateUrls(test: TestShape, url: string): TestShape {
  return Object.assign({}, test, {
    commands: test.commands.map((command) => {
      if (command.command === 'open') {
        return Object.assign({}, command, {
          target: new URL(command.target as string, url).href,
        })
      }
      return command
    }),
  })
}

function sanitizeXml(data: string): string {
  return data
    .replace(/<br \/>/g, '\\n')
    .replace(/<link(.*")\s*\/{0}>/g, (_match, group) => `<link${group} />`)
    .replace(
      /<td>(.*)<\/td>/g,
      (_match, group) => `<td>${xmlescape(group)}</td>`
    )
    .replace(/<!--(.|\s)*?-->/g, '')
}

function parseTarget(targetCell: any) {
  if (targetCell._text) {
    if (targetCell._text instanceof Array) {
      return targetCell._text.join('\\n')
    } else {
      return targetCell._text
    }
  } else {
    return ''
  }
}

function isImplementedWait(command: string) {
  if (/^wait/.test(command)) {
    return Commands[command]
  } else {
    // not a wait command
    return true
  }
}
