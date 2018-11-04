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

import pause from './pause'
import implicitLocators from './implicit-locators'
import scriptInterpolation from './script-interpolation'
import waitForCommands from './wait-for-commands'
import variableName from './variable-name'

export const migrators = {
  pause,
  implicitLocators,
  scriptInterpolation,
  waitForCommands,
  variableName,
}

export default Object.keys(migrators).reduce((migs, migName) => {
  const mig = migrators[migName]
  if (!migs[mig.version]) {
    migs[mig.version] = {}
  }
  migs[mig.version][migName] = mig

  return migs
}, {})
