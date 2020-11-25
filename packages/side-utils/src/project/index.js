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

import url from 'url'

export function normalizeTestsInSuite({ suite, tests }) {
  if (!suite) return
  let _suite = { ...suite }
  _suite.tests.forEach((testId, index) => {
    _suite.tests[index] = tests.find(test => test.id === testId).name
  })
  return _suite
}

export function sanitizeProjectName(projectName) {
  let name = projectName
  if (name.startsWith('http')) {
    // eslint-disable-next-line node/no-deprecated-api
    return url.parse(projectName).host
  } else {
    return name.replace(/([^a-z0-9\u4e00-\u9fa5 ._#-]+)/gi, '')
  }
}

module.exports = {
  normalizeTestsInSuite,
  sanitizeProjectName,
}
