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

import stringEscape from '../string-escape'

function escapeString(string, { preprocessor, ignoreEscaping }) {
  if (ignoreEscaping) return string
  else if (preprocessor && preprocessor.name === 'scriptPreprocessor')
    return string.replace(/"/g, "'")
  else return stringEscape(string)
}

export function preprocessParameter(
  param,
  preprocessor,
  variableLookup,
  { ignoreEscaping }
) {
  const escapedParam = escapeString(param, { preprocessor, ignoreEscaping })
  return preprocessor
    ? preprocessor(escapedParam, variableLookup)
    : defaultPreprocessor(escapedParam, variableLookup)
}

export function defaultPreprocessor(param, variableLookup) {
  if (!param) return
  const _var = param.match(/\$\{(\w+)\}/)
  if (_var) {
    return param.replace(_var[0], variableLookup(_var[1]))
  } else {
    return param
  }
}

export function scriptPreprocessor(script) {
  let value = script.replace(/^\s+/, '').replace(/\s+$/, '')
  let r2
  let parts = []
  const variablesUsed = {}
  const argv = []
  let argl = 0 // length of arguments
  if (/\$\{/.exec(value)) {
    const regexp = /\$\{(.*?)\}/g
    let lastIndex = 0
    while ((r2 = regexp.exec(value))) {
      const variableName = r2[1]
      if (r2.index - lastIndex > 0) {
        parts.push(value.substring(lastIndex, r2.index))
      }
      if (!variablesUsed.hasOwnProperty(variableName)) {
        variablesUsed[variableName] = argl
        argv.push(variableName)
        argl++
      }
      parts.push(`arguments[${variablesUsed[variableName]}]`)
      lastIndex = regexp.lastIndex
    }
    if (lastIndex < value.length) {
      parts.push(value.substring(lastIndex, value.length))
    }
    return {
      script: parts.join(''),
      argv,
    }
  } else {
    return {
      script: value,
      argv,
    }
  }
}

export function keysPreprocessor(str, variableLookup) {
  let keys = []
  let match = str.match(/\$\{\w+\}/g)
  if (!match) {
    keys.push(str)
  } else {
    let i = 0
    while (i < str.length) {
      let currentKey = match.shift(),
        currentKeyIndex = str.indexOf(currentKey, i)
      if (currentKeyIndex > i) {
        // push the string before the current key
        keys.push(str.substr(i, currentKeyIndex - i))
        i = currentKeyIndex
      }
      if (currentKey) {
        if (/^\$\{KEY_\w+\}/.test(currentKey)) {
          // is a key
          let keyName = currentKey.match(/\$\{KEY_(\w+)\}/)[1]
          keys.push(`Key['${keyName}']`)
        } else {
          // not a key, assume stored variables interpolation
          keys.push(defaultPreprocessor(currentKey, variableLookup))
        }
        i += currentKey.length
      } else if (i < str.length) {
        // push the rest of the string
        keys.push(str.substr(i, str.length))
        i = str.length
      }
    }
  }
  return keys
}
