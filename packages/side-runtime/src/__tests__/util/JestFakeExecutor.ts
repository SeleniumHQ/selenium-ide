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

import { CommandShape } from '@seleniumhq/side-model'
import Variables from '../../variables'

export default class FakeExecutor {
  customCommands: { [key: string]: () => void } = {}
  implicitWait = 50
  initialized: boolean = false
  killed: boolean = false
  variables: Variables = new Variables()

  constructor(..._args: any[]) {
    return this
  }

  init = jest.fn(({ variables }: { variables: Variables }) => {
    // this can be async
    this.variables = variables
    this.initialized = true
  })

  executeHook = jest.fn()

  name = jest.fn((command: string) => {
    if (!command) {
      return 'skip'
    }

    const upperCase = command.charAt(0).toUpperCase() + command.slice(1)
    const func = 'do' + upperCase
    // @ts-expect-error idk what to do here
    if (!this[func]) {
      throw new Error(`Unknown command ${command}`)
    }
    return func
  })

  cancel = jest.fn()
  cleanup = jest.fn()
  kill = jest.fn(async () => {
    this.killed = true
  })

  beforeCommand = jest.fn(async (_commandObject: CommandShape) => {
    if (!this.initialized) throw new Error('executor is dead')
    if (this.killed) throw new Error('playback is dead')
  })

  afterCommand = jest.fn((_commandObject: CommandShape) => {
    if (!this.initialized) throw new Error('executor is dead')
    if (this.killed) throw new Error('playback is dead')
  })

  doAssert = jest.fn()
  doAssertText = jest.fn()
  doPause = jest.fn(
    (timeout = 0) =>
      new Promise((res) => {
        setTimeout(res, Number(timeout))
      })
  )
  doOpen = jest.fn()
  doVerify = jest.fn()
  doVerifyText = jest.fn()
  doFake = jest.fn()
  evaluateConditional = jest.fn()
}
