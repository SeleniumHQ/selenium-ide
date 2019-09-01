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

import Argument from './argument'

const firstTokenRegex = /[a-z_]/i
const anyTokenRegex = /[a-z0-9_]/i

export default new Argument({
  name: 'Variable',
  description: `The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').`,
  identify: (value: string) => typeof value === 'string',
  validate: (value: string) => {
    const identifiers = value.split('.')

    for (const identifier of identifiers) {
      if (!identifier) {
        throw new SyntaxError('Invalid empty identifier')
      }

      let firstTokenChecked = false

      for (const token of identifier) {
        if (!firstTokenChecked) {
          firstTokenChecked = true
          if (firstTokenRegex.test(token)) continue
        } else {
          if (anyTokenRegex.test(token)) continue
        }
        throw new SyntaxError(`Unexpected token ${token}`)
      }
    }

    return true
  },
})
