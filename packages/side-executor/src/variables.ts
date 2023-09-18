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

export type BaseVariableResolver<TYPE> = (key: string) => TYPE

export default class BaseVariables<TYPE> {
  constructor(resolveMethod: BaseVariableResolver<TYPE>) {
    this.resolveMethod = resolveMethod
  }
  resolveMethod: BaseVariableResolver<TYPE>
  storedVars: Map<string, TYPE> = new Map()

  get(key: string) {
    if (this.storedVars.has(key)) {
      return this.storedVars.get(key)
    }
    const value = this.resolveMethod(key)
    if (value) {
      this.storedVars.set(key, value)
    }
    return value
  }

  set(key: string, value: TYPE) {
    return this.storedVars.set(key, value)
  }

  has(key: string) {
    return this.storedVars.has(key)
  }

  delete(key: string) {
    if (this.storedVars.has(key)) this.storedVars.delete(key)
  }

  clear() {
    this.storedVars.clear()
  }
}
