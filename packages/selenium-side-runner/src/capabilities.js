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

export function parseString(input) {
  const capabilities = {}

  matchStringPairs(input).forEach(({ key, value }) => {
    Object.assign(capabilities, assignStringKey(key, parseStringValue(value)))
  })

  return capabilities
}

export default {
  parseString,
}

function matchStringPairs(input) {
  const regex = /([^ =]*) ?= ?(".*"|[^ ]*)/g
  let result
  const splitCapabilities = []
  while ((result = regex.exec(input)) !== null) {
    splitCapabilities.push({ key: result[1], value: result[2] })
  }

  return splitCapabilities
}

function assignStringKey(key, value) {
  const keyObject = {}
  key.split('.').reduce((objectKey, currKey, index, keys) => {
    const ref = {}
    objectKey[currKey] = keys.length === index + 1 ? value : ref
    return ref
  }, keyObject)

  return keyObject
}

function parseStringValue(value) {
  // is array
  if (/^\[.*\]$/.test(value)) {
    return value.match(/((\w|-)*)/g).filter(s => !!s)
  }
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}
