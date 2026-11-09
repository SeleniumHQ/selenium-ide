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

// Runs JavaScript from a test in this frame. Extension code can't use eval in
// Manifest V3, so the background runs the script with userScripts.execute.
// The script catches its own errors, because the browser doesn't return
// Error objects.
//
// Options:
// - isExpression: the script is an expression, not a function body
// - result: what to send back: 'none', 'boolean' or 'value'. A value is
//   copied as JSON, like messages between the page and the IDE.
// - awaitPromise: wait for a returned promise and send back its result.
//   Otherwise a returned promise is only reported with `isPromise`.
//
// Returns `{ value, isPromise, type }`.
export async function runUserScript(
  script,
  argv = [],
  { isExpression = false, result = 'none', awaitPromise = false } = {}
) {
  const fn = isExpression
    ? `(...arguments) => (\n${script}\n)`
    : `(...arguments) => {\n${script}\n}`
  const args = JSON.stringify(JSON.stringify(argv))
  const code = `(() => {
  const toError = e => ({
    error: e && e.message !== undefined ? String(e.message) : String(e),
  })
  const typeOf = value => {
    if (!value) return String(value)
    try {
      if (value.constructor && value.constructor.name) return value.constructor.name
    } catch (e) {}
    return Object.prototype.toString.call(value).slice(8, -1)
  }
  const send = (value, extra) => {
    const out = Object.assign({ type: typeOf(value) }, extra)
    if (${JSON.stringify(result)} === 'boolean') out.value = !!value
    if (${JSON.stringify(result)} === 'value' && value !== undefined) {
      out.value = JSON.parse(JSON.stringify(value))
    }
    return out
  }
  try {
    const value = (${fn})(...JSON.parse(${args}))
    if (value && typeof value.then === 'function') {
      if (!${awaitPromise}) return { isPromise: true, type: 'Promise' }
      return Promise.resolve(value).then(
        value => send(value, { isPromise: true }),
        toError
      ).catch(toError)
    }
    return send(value)
  } catch (e) {
    return toError(e)
  }
})()`
  const response = await browser.runtime.sendMessage({ runUserScript: code })
  if (!response) {
    throw new Error('The script did not return a result')
  }
  if (response.error !== undefined) {
    throw new Error(response.error)
  }
  return response
}
