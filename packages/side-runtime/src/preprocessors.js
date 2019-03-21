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

const nbsp = String.fromCharCode(160)

// this function is meant to be composed on the prototype of the executor
// refer to preprocessor.spec.js for an example on how to do so
// this will define this to be in scope allowing the executor function to
// have this in scope as well as grant the preprocessor access to the variables
export function composePreprocessors(...args) {
  const func = args[args.length - 1]
  const params = args.slice(0, args.length - 1)
  if (params.length === 0) {
    return func
  } else if (params.length === 1) {
    return function preprocess(target) {
      return func.call(this, runPreprocessor(params[0], target, this.variables))
    }
  } else if (params.length === 2) {
    return function preprocess(target, value) {
      return func.call(
        this,
        runPreprocessor(params[0], target, this.variables),
        runPreprocessor(params[1], value, this.variables)
      )
    }
  } else {
    return function preprocess(target, value, options) {
      if (!options) {
        return func.call(
          this,
          runPreprocessor(params[0], target, this.variables),
          runPreprocessor(params[1], value, this.variables)
        )
      }
      return func.call(
        this,
        runPreprocessor(params[0], target, this.variables),
        runPreprocessor(params[1], value, this.variables),
        preprocessObject(params[2], options, this.variables)
      )
    }
  }
}

function runPreprocessor(preprocessor, value, ...args) {
  if (typeof preprocessor === 'function') {
    return preprocessor(value, ...args)
  }
  return value
}

function preprocessObject(preprocessors, obj, ...args) {
  const result = { ...obj }

  Object.keys(preprocessors).forEach(prop => {
    if (result[prop]) {
      result[prop] = runPreprocessor(preprocessors[prop], result[prop], ...args)
    }
  })

  return result
}

export function preprocessArray(interpolator) {
  return function preprocessArray(items, variables) {
    return items.map(item => interpolator(item, variables))
  }
}

export function interpolateString(value, variables) {
  value = value.replace(/^\s+/, '')
  value = value.replace(/\s+$/, '')
  let r2
  let parts = []
  if (/\$\{/.exec(value)) {
    const regexp = /\$\{(.*?)\}/g
    let lastIndex = 0
    while ((r2 = regexp.exec(value))) {
      if (variables.has(r2[1])) {
        if (r2.index - lastIndex > 0) {
          parts.push(string(value.substring(lastIndex, r2.index)))
        }
        parts.push(variables.get(r2[1]))
        lastIndex = regexp.lastIndex
      } else if (r2[1] == 'nbsp') {
        if (r2.index - lastIndex > 0) {
          parts.push(
            variables.get(string(value.substring(lastIndex, r2.index)))
          )
        }
        parts.push(nbsp)
        lastIndex = regexp.lastIndex
      }
    }
    if (lastIndex < value.length) {
      parts.push(string(value.substring(lastIndex, value.length)))
    }
    return parts.map(String).join('')
  } else {
    return string(value)
  }
}

export function interpolateScript(script, variables) {
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
      if (variables.has(variableName)) {
        if (r2.index - lastIndex > 0) {
          parts.push(string(value.substring(lastIndex, r2.index)))
        }
        if (!variablesUsed.hasOwnProperty(variableName)) {
          variablesUsed[variableName] = argl
          argv.push(variables.get(variableName))
          argl++
        }
        parts.push(`arguments[${variablesUsed[variableName]}]`)
        lastIndex = regexp.lastIndex
      }
    }
    if (lastIndex < value.length) {
      parts.push(string(value.substring(lastIndex, value.length)))
    }
    return {
      script: parts.join(''),
      argv,
    }
  } else {
    return {
      script: string(value),
      argv,
    }
  }
}

function string(value) {
  if (value != null) {
    value = value.replace(/\\\\/g, '\\')
    value = value.replace(/\\r/g, '\r')
    value = value.replace(/\\n/g, '\n')
    return value
  } else {
    return ''
  }
}
