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

export function deduplicateReusedTestMethods(testMethods) {
  return testMethods.filter((entry, index) => {
    const firstEntryIndex = testMethods.findIndex(
      entry2 => entry2.name === entry.name
    )
    const isFirstEntry = firstEntryIndex === index
    return isFirstEntry
  })
}

export function findReusedTestMethods(test, tests) {
  let results = []
  for (const command of test.commands) {
    if (command.command === 'run') {
      const reusedTest = tests.find(test => test.name === command.target)
      results.push({ name: reusedTest.name, commands: reusedTest.commands })
      results = results.concat(findReusedTestMethods(reusedTest, tests))
    }
  }
  return deduplicateReusedTestMethods(results)
}

export function findCommandThatOpensWindow(test, tests) {
  let result
  for (const command of test.commands) {
    if (command.opensWindow) {
      result = command
      break
    }
    if (command.command === 'run') {
      const nestedTests = findReusedTestMethods(test, tests)
      for (const nestedTest in nestedTests) {
        return findCommandThatOpensWindow(nestedTests[nestedTest], nestedTests)
      }
    }
  }
  return result
}
