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

import browser from 'webextension-polyfill'

// Runs JavaScript from a test in this frame and returns
// `{ value, isPromise, type }`. Extension code can't use eval in Manifest V3,
// so the background runs the script with userScripts.execute. Errors are
// caught inside the script, because the browser doesn't return Error objects.
export async function runUserScript(script, argv = [], isExpression = false) {
  const fn = isExpression
    ? `(...arguments) => (\n${script}\n)`
    : `(...arguments) => {\n${script}\n}`
  const args = JSON.stringify(JSON.stringify(argv))
  const code = `(() => {
  const toError = e => ({
    error: e && e.message !== undefined ? String(e.message) : String(e),
  })
  try {
    const value = (${fn})(...JSON.parse(${args}))
    if (value && typeof value.then === 'function') {
      return Promise.resolve(value).then(
        value => ({ value, isPromise: true }),
        toError
      )
    }
    return { value, type: value ? value.constructor.name : String(value) }
  } catch (e) {
    return toError(e)
  }
})()`
  const result = await browser.runtime.sendMessage({ runUserScript: code })
  if (!result) {
    throw new Error('The script did not return a result')
  }
  if (result.error !== undefined) {
    throw new Error(result.error)
  }
  return result
}
