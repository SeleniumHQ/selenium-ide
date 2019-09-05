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

import Command from '../../src/commands/command'
import ArgType from '../../src/args/arg-type'
import Argument from '../../src/args/argument'

describe('command', () => {
  it('should have name and description', () => {
    const cmd = new Command({
      name: 'cmd',
      description: 'desc',
      args: {},
      validate: () => true,
    })

    expect(cmd.name).toBe('cmd')
    expect(cmd.description).toBe('desc')
  })

  it('should have an arg-type', () => {
    const arg = new Argument({
      name: 'arg',
      description: 'arg',
      identify: (n: number) => typeof n === 'number',
      validate: (n: number) => n === 1,
    })
    const at = new ArgType([arg])
    const cmd = new Command({
      name: 'cmd',
      description: 'desc',
      args: { num: at },
      validate: ({ num }) => at.validate(num),
    })
    expect(cmd.validate({ num: 1 })).toBeTruthy()
    expect(cmd.validate({ num: 2 })).toBeFalsy()
  })
})
