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

import { Fn } from '@seleniumhq/side-commons'
import Variables from './variables'

const nbsp = String.fromCharCode(160)

// this function is meant to be composed on the prototype of the executor
// refer to preprocessor.spec.js for an example on how to do so
// this will define this to be in scope allowing the executor function to
// have this in scope as well as grant the preprocessor access to the variables
export function composePreprocessors(...args: any[]) {
  const func = args[args.length - 1]
  const params = args.slice(0, args.length - 1)
  if (params.length === 0) {
    return func
  } else if (params.length === 1) {
    return function preprocess(target: any) {
      // @ts-expect-error
      return func.call(this, runPreprocessor(params[0], target, this.variables))
    }
  } else if (params.length === 2) {
    return function preprocess(target: any, value: any) {
      return func.call(
        // @ts-expect-error
        this,
        // @ts-expect-error
        runPreprocessor(params[0], target, this.variables),
        // @ts-expect-error
        runPreprocessor(params[1], value, this.variables)
      )
    }
  } else {
    return function preprocess(target: any, value: any, options: any) {
      if (!options) {
        return func.call(
          // @ts-expect-error
          this,
          // @ts-expect-error
          runPreprocessor(params[0], target, this.variables),
          // @ts-expect-error
          runPreprocessor(params[1], value, this.variables)
        )
      }
      return func.call(
        // @ts-expect-error
        this,
        // @ts-expect-error
        runPreprocessor(params[0], target, this.variables),
        // @ts-expect-error
        runPreprocessor(params[1], value, this.variables),
        // @ts-expect-error
        preprocessObject(params[2], options, this.variables)
      )
    }
  }
}

function runPreprocessor(preprocessor: Fn, value: any, ...args: any[]) {
  if (typeof preprocessor === 'function') {
    return preprocessor(value, ...args)
  }
  return value
}

function preprocessObject(
  preprocessors: Record<string, Fn>,
  obj: Record<string, unknown>,
  ...args: any[]
) {
  const result = { ...obj }

  Object.keys(preprocessors).forEach((prop) => {
    if (result[prop]) {
      result[prop] = runPreprocessor(preprocessors[prop], result[prop], ...args)
    }
  })

  return result
}

export type Interpolator = (value: string, variables: Variables) => string

export function preprocessArray(interpolator: Interpolator) {
  return function preprocessArray(items: string[], variables: Variables) {
    return items.map((item) => [interpolator(item[0], variables), item[1]])
  }
}

export function interpolateString(value: string, variables: Variables) {
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

export function interpolateScript(script: string, variables: Variables) {
  let value = script.replace(/^\s+/, '').replace(/\s+$/, '')
  let r2
  let parts = []
  const variablesUsed: Record<string, unknown> = {}
  const argv: any[] = []
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
        if (
          !Object.prototype.hasOwnProperty.call(variablesUsed, variableName)
        ) {
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

function string(value: string | null) {
  if (value != null) {
    value = value.replace(/\\\\/g, '\\')
    value = value.replace(/\\r/g, '\r')
    value = value.replace(/\\n/g, '\n')
    return value
  } else {
    return ''
  }
}
