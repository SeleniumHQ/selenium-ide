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

const emitters = {
  id: emitId,
  value: emitValue,
  label: emitLabel,
  index: emitIndex,
}

export function emit(location) {
  return new Promise(async (res, rej) => {
    const [type, selector] = location.split('=')
    if (emitters[type] && selector) {
      let result = await emitters[type](selector)
      res(result)
    } else if (!selector) {
      // no selector strategy given, assuming label
      res(await emitters['label'](type))
    } else {
      rej(new Error(`Unknown selection locator ${type}`))
    }
  })
}

export default {
  emit,
}

function emitId(id) {
  return Promise.resolve(`By.css(\`*[id="${id}"]\`)`)
}

function emitValue(value) {
  return Promise.resolve(`By.css(\`*[value="${value}"]\`)`)
}

function emitLabel(label) {
  return Promise.resolve(`By.xpath(\`//option[. = '${label}']\`)`)
}

function emitIndex(index) {
  return Promise.resolve(`By.css(\`*:nth-child(${index})\`)`)
}
