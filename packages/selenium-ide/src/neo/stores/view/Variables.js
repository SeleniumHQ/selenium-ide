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

import { action, observable } from 'mobx'

export default class Variables {
  @observable.shallow
  storedVars = new Map()

  @action.bound
  get(key) {
    if (this.storedVars.get(key) == undefined) {
      if (/(\.)/.exec(key)) {
        let propertyAccess = /(\w+)\.(.*)/.exec(key)
        if (this.storedVars.has(propertyAccess[1])) {
          var r3 = getPropertyValue(
            this.storedVars.get(propertyAccess[1]),
            propertyAccess[2]
          )
          return r3
        }
      }
      return this.storedVars.get(key)
    }
    return this.storedVars.get(key)
  }

  @action.bound
  set(key, value) {
    this.storedVars.set(key, value)
  }

  @action.bound
  has(key) {
    if (this.storedVars.has(key) == false) {
      if (/(\.)/.exec(key)) {
        let propertyAccess = /(\w+)\.(.*)/.exec(key)
        return this.storedVars.has(propertyAccess[1])
      }
    }
    return this.storedVars.has(key)
  }

  @action.bound
  delete(key) {
    if (this.storedVars.has(key)) this.storedVars.delete(key)
    else if (/(\.)/.exec(key)) {
      let propertyAccess = /(\w+)\.(.*)/.exec(key)
      this.storedVars.delete(propertyAccess[1])
    }
  }

  @action.bound
  clear() {
    this.storedVars.clear()
  }
}

function getPropertyValue(obj1, dataToRetrieve) {
  return dataToRetrieve.split('.').reduce(function(o, k) {
    if (/(\w+)\[(\d*)\]/.exec(k)) {
      let arr = /(\w+)\[(\d*)\]/.exec(k)
      return o && o[arr[1]][arr[2]]
    }
    return o && o[k]
  }, obj1)
}
