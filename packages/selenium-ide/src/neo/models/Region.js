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

export default class Region {
  constructor(region = '') {
    this.x = (region.match(/x:\s*(\d*)/) || [])[1]
    this.y = (region.match(/y:\s*(\d*)/) || [])[1]
    this.width = (region.match(/width:\s*(\d*)/) || [])[1]
    this.height = (region.match(/height:\s*(\d*)/) || [])[1]
    this.isValid = this.isValid.bind(this)
  }
  isValid() {
    return !!(this.x + 1 && this.y + 1 && this.width + 1 && this.height + 1)
  }
  toJS() {
    return this.isValid
      ? {
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height,
        }
      : undefined
  }
}
