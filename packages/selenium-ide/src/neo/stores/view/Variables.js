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
        //a.b , a[0].b, a.b[3].c
        let propertyAccess = /([^.\n]+)\.(.*)/.exec(key)
        if (this.storedVars.has(propertyAccess[1])) {
          //a.b, a.b[0].c
          let r3 = getPropertyValue(
            this.storedVars.get(propertyAccess[1]),
            propertyAccess[2]
          )
          return r3
        } else if (/([^.\n]+)\[(\d*)\]/.exec(propertyAccess[1])) {
          //a[0].b
          let arrayAccess = /([^.\n]+)\[(\d*)\]/.exec(propertyAccess[1])
          if (this.storedVars.has(arrayAccess[1])) {
            let r3 = getPropertyValue(
              this.storedVars.get(arrayAccess[1])[arrayAccess[2]],
              propertyAccess[2]
            )
            return r3
          }
        }
      } else if (/([^.\n]+)\[(\d*)\]/.exec(key)) {
        //a[0]
        let arrayAccess = /([^.\n]+)\[(\d*)\]/.exec(key)
        if (this.storedVars.has(arrayAccess[1])) {
          let r3 = this.storedVars.get(arrayAccess[1])
          return r3[arrayAccess[2]]
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
        //a.b or a[0].b or a.b[0].c
        let propertyAccess = /([^.\n]+)\.(.*)/.exec(key)
        if (
          this.storedVars.has(propertyAccess[1]) == false &&
          /([^.\n]+)\[(\d*)\]/.exec(propertyAccess[1])
        ) {
          //arr[0].a
          let arrayAccess = /([^.\n]+)\[(\d*)\]/.exec(propertyAccess[1])
          return this.storedVars.has(arrayAccess[1])
        } else return this.storedVars.has(propertyAccess[1])
      } else if (/([^.\n]+)\[(\d*)\]/.exec(key)) {
        // a[0]
        let arrayAccess = /([^.\n]+)\[(\d*)\]/.exec(key)
        return this.storedVars.has(arrayAccess[1])
      }
    }
    return this.storedVars.has(key)
  }

  @action.bound
  delete(key) {
    if (this.storedVars.has(key)) this.storedVars.delete(key)
    else if (/(\.)/.exec(key)) {
      let propertyAccess = /([^.]+)\.(.*)/.exec(key)
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
    if (/([^.\n]+)\[(\d*)\]/.exec(k)) {
      let arr = /([^.\n]+)\[(\d*)\]/.exec(k)
      return o && o[arr[1]][arr[2]]
    }
    return o && o[k]
  }, obj1)
}
