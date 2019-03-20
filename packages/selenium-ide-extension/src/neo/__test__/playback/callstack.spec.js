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

import Callstack from '../../playback/callstack'

describe('Call stack', () => {
  it('should be able to call and unwind', () => {
    const callee = {
      id: 2,
      commands: [
        {
          command: 'open',
          target: '',
          value: '',
        },
      ],
    }

    const proc = {
      callee,
      caller: {
        position: undefined,
        tree: undefined,
      },
    }

    const cs = new Callstack()
    expect(cs.length).toBe(0)
    cs.call(proc)
    expect(cs.length).toBe(1)
    expect(cs.unwind()).toBe(proc)
    expect(cs.length).toBe(0)
  })
  it('should throw if trying to unwind an empty stack', () => {
    const cs = new Callstack()
    expect(() => cs.unwind()).toThrow()
  })
  it('should access the current executing procedure', () => {
    const cs = new Callstack()
    const proc = {}
    cs.call(proc)
    expect(cs.top()).toBe(proc)
    expect(cs.length).toBe(1)
  })
})
