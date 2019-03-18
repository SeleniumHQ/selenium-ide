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

export default class FakeExecutor {
  init({ _baseUrl, variables }) {
    // this can be async
    this.variables = variables
  }

  async cleanup() {}

  name(command) {
    if (!command) {
      return 'skip'
    }

    const upperCase = command.charAt(0).toUpperCase() + command.slice(1)
    const func = 'do' + upperCase
    if (!this[func]) {
      throw new Error(`Unknown command ${command}`)
    }
    return func
  }

  async cancel() {
    // no-op in this case
  }

  async kill() {
    this.killed = true
  }

  async beforeCommand(_commandObject) {
    if (this.killed) throw new Error('playback is dead')
  }

  async afterCommand(_commandObject) {
    if (this.killed) throw new Error('playback is dead')
  }

  async doPause(timeout = 0) {
    await new Promise(res => {
      setTimeout(res, parseInt(timeout))
    })
  }
}
