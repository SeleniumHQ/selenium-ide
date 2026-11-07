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

// A nested name: a variable name followed by .key or [index] parts,
// like user.name, items.0 or items[0].name
const NESTED_NAME = /^(\w+)((?:\.\w+|\[\d+\])+)$/
const NESTED_PART = /\.(\w+)|\[(\d+)\]/g

// The keys of a nested name after the variable name: items[0].name gives
// ['0', 'name']
const nestedNameParts = (parts: string) => {
  const keys: string[] = []
  const regexp = new RegExp(NESTED_PART)
  let match
  while ((match = regexp.exec(parts))) keys.push(match[1] ?? match[2])
  return keys
}

export default class Variables {
  constructor() {
    this.storedVars = new Map()
  }
  storedVars: Map<string, any>

  get(key: string) {
    if (key.startsWith('env:')) {
      return process.env[key.slice(4)]
    }
    if (this.storedVars.has(key)) return this.storedVars.get(key)
    return this.getNested(key)?.value
  }

  set(key: string, value: any) {
    this.storedVars.set(key, value)
  }

  has(key: string) {
    if (key.startsWith('env:')) {
      return true
    }
    return this.storedVars.has(key) || this.getNested(key) !== undefined
  }

  // Reads a nested name when no variable has that exact name. Only own
  // properties of objects and arrays are read, so names like a.constructor
  // don't reach the prototype. Returns undefined when a part is missing.
  private getNested(key: string): { value: any } | undefined {
    const match = NESTED_NAME.exec(key)
    if (!match || !this.storedVars.has(match[1])) return undefined
    let value = this.storedVars.get(match[1])
    for (const part of nestedNameParts(match[2])) {
      if (
        value === null ||
        typeof value !== 'object' ||
        !Object.prototype.hasOwnProperty.call(value, part)
      ) {
        return undefined
      }
      value = value[part]
    }
    return { value }
  }

  delete(key: string) {
    if (this.storedVars.has(key)) this.storedVars.delete(key)
  }

  clear() {
    this.storedVars.clear()
  }
}
